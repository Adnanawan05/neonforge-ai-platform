import asyncio
import json
import uuid
from datetime import datetime
from typing import Any

import orjson
from fastapi import WebSocket
from sqlalchemy import text

from app.core.db import SessionLocal
from app.services.phases.cleaner import run_cleaner
from app.services.phases.processor import run_processor
from app.services.phases.ml import train_models
from app.services.phases.painter import build_story
from app.services.phases.insights import generate_insights
from app.services.phases.export import export_pdf


class JobHub:
    def __init__(self):
        self._lock = asyncio.Lock()
        self._sockets: dict[str, set[WebSocket]] = {}

    async def attach(self, job_id: str, ws: WebSocket):
        async with self._lock:
            self._sockets.setdefault(job_id, set()).add(ws)
        snap = await JobManager.get(job_id)
        await ws.send_text(orjson.dumps({"type": "snapshot", "job": snap}).decode())
        while True:
            msg = await ws.receive_text()
            if msg.strip() == "ping":
                await ws.send_text("pong")

    async def detach(self, job_id: str, ws: WebSocket):
        async with self._lock:
            if job_id in self._sockets and ws in self._sockets[job_id]:
                self._sockets[job_id].remove(ws)

    async def broadcast(self, job_id: str, payload: dict[str, Any]):
        data = orjson.dumps(payload).decode()
        async with self._lock:
            sockets = list(self._sockets.get(job_id, set()))
        for ws in sockets:
            try:
                await ws.send_text(data)
            except Exception:
                await self.detach(job_id, ws)


job_hub = JobHub()


class JobManager:
    @staticmethod
    async def create_and_run(payload: dict[str, Any]) -> str:
        job_id = uuid.uuid4().hex
        now = datetime.utcnow().isoformat() + "Z"
        async with SessionLocal() as s:
            await s.execute(
                text(
                    "INSERT INTO jobs (id,status,phase,progress,created_at,updated_at,payload_json) VALUES (:id,:status,:phase,:progress,:c,:u,:p)"
                ),
                {
                    "id": job_id,
                    "status": "running",
                    "phase": "collector",
                    "progress": 0.02,
                    "c": now,
                    "u": now,
                    "p": json.dumps(payload),
                },
            )
            await s.commit()

        asyncio.create_task(JobManager._runner(job_id, payload))
        return job_id

    @staticmethod
    async def _event(job_id: str, level: str, phase: str | None, message: str, data: dict | None = None):
        now = datetime.utcnow().isoformat() + "Z"
        async with SessionLocal() as s:
            await s.execute(
                text(
                    "INSERT INTO events (job_id,ts,level,phase,message,data_json) VALUES (:j,:t,:l,:p,:m,:d)"
                ),
                {"j": job_id, "t": now, "l": level, "p": phase, "m": message, "d": json.dumps(data) if data else None},
            )
            await s.commit()
        await job_hub.broadcast(job_id, {"type": "event", "ts": now, "level": level, "phase": phase, "message": message, "data": data})

    @staticmethod
    async def _set(job_id: str, **fields):
        fields["updated_at"] = datetime.utcnow().isoformat() + "Z"
        sets = ",".join([f"{k}=:{k}" for k in fields.keys()])
        fields["id"] = job_id
        async with SessionLocal() as s:
            await s.execute(text(f"UPDATE jobs SET {sets} WHERE id=:id"), fields)
            await s.commit()
        await job_hub.broadcast(job_id, {"type": "job", "job": await JobManager.get(job_id)})

    @staticmethod
    async def _runner(job_id: str, payload: dict[str, Any]):
        ds = payload["dataset_id"]
        target = payload.get("target")
        task = payload.get("task")
        try:
            await JobManager._event(job_id, "info", "collector", "Dataset locked into pipeline", {"dataset_id": ds})

            await JobManager._set(job_id, phase="cleaner", progress=0.12)
            clean = await run_cleaner(ds)
            await JobManager._event(job_id, "info", "cleaner", "Data Surgeon completed", {"duplicates_removed": clean.get("duplicates_removed")})

            await JobManager._set(job_id, phase="processor", progress=0.28)
            proc = await run_processor(ds)
            await JobManager._event(job_id, "info", "processor", "Feature Processor completed", {"generated": proc.get("generated"), "encoded": proc.get("encoded")})

            ml = None
            if target:
                await JobManager._set(job_id, phase="ml", progress=0.52)
                ml = await train_models(ds, target, task)
                await JobManager._event(job_id, "info", "ml", "AI Heart trained", {"best_model": ml.get("best_model"), "metrics": ml.get("metrics")})

            await JobManager._set(job_id, phase="painter", progress=0.64)
            story = await build_story(ds)
            await JobManager._event(job_id, "info", "painter", "Painter composed story visuals", {"kpis": story.get("kpis")})

            await JobManager._set(job_id, phase="insights", progress=0.76)
            ins = await generate_insights(ds)
            await JobManager._event(job_id, "info", "insights", "Oracle insights generated", {"count": len(ins.get("insights", []))})

            await JobManager._set(job_id, phase="export", progress=0.90)
            pdf_path = await export_pdf(ds)
            await JobManager._event(job_id, "info", "export", "Report generated", {"pdf": pdf_path})

            result = {"cleaner": clean, "processor": proc, "ml": ml, "painter": story, "insights": ins, "pdf": pdf_path}
            await JobManager._set(job_id, status="done", phase="done", progress=1.0, result_json=json.dumps(result))
            await JobManager._event(job_id, "info", "done", "Pipeline complete", {"job_id": job_id})
        except Exception as e:
            await JobManager._set(job_id, status="error", phase="error", progress=1.0, error_json=json.dumps({"message": str(e)}))
            await JobManager._event(job_id, "error", "error", "Pipeline failed", {"error": str(e)})

    @staticmethod
    async def get(job_id: str) -> dict[str, Any]:
        async with SessionLocal() as s:
            r = (await s.execute(text("SELECT * FROM jobs WHERE id=:id"), {"id": job_id})).mappings().first()
        if not r:
            return {"id": job_id, "status": "missing"}
        return {
            "id": r["id"],
            "status": r["status"],
            "phase": r["phase"],
            "progress": float(r["progress"]),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "payload": json.loads(r["payload_json"]) if r["payload_json"] else None,
            "result": json.loads(r["result_json"]) if r["result_json"] else None,
            "error": json.loads(r["error_json"]) if r["error_json"] else None,
        }

    @staticmethod
    async def list_events(limit: int = 200):
        async with SessionLocal() as s:
            rows = (await s.execute(text("SELECT job_id,ts,level,phase,message,data_json FROM events ORDER BY id DESC LIMIT :l"), {"l": limit})).mappings().all()
        out = []
        for r in rows:
            out.append({
                "job_id": r["job_id"],
                "ts": r["ts"],
                "level": r["level"],
                "phase": r["phase"],
                "message": r["message"],
                "data": json.loads(r["data_json"]) if r["data_json"] else None,
            })
        return out
