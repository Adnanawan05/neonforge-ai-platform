import os
import json
import uuid
import io
from datetime import datetime
from typing import Any

import pandas as pd
import httpx
from sqlalchemy import create_engine

from app.core.config import settings
from app.utils.stats import dataset_summary


class DatasetStore:
    @staticmethod
    def _paths(dataset_id: str):
        base = os.path.join(settings.upload_dir)
        os.makedirs(base, exist_ok=True)
        return {
            "csv": os.path.join(base, f"{dataset_id}.csv"),
            "meta": os.path.join(base, f"{dataset_id}.meta.json"),
        }

    @staticmethod
    async def from_upload(file) -> dict:
        dataset_id = uuid.uuid4().hex
        name = file.filename or f"upload-{dataset_id}.csv"
        paths = DatasetStore._paths(dataset_id)

        raw = await file.read()
        if name.lower().endswith((".xlsx", ".xls")):
            tmp = paths["csv"] + ".xlsx"
            with open(tmp, "wb") as f:
                f.write(raw)
            df = pd.read_excel(tmp)
            df.to_csv(paths["csv"], index=False)
            os.remove(tmp)
        else:
            with open(paths["csv"], "wb") as f:
                f.write(raw)

        meta = {
            "dataset_id": dataset_id,
            "name": name,
            "source": "upload",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        with open(paths["meta"], "w", encoding="utf-8") as f:
            json.dump(meta, f)
        return meta

    @staticmethod
    async def from_api(name: str, url: str, method: str, headers: dict[str, str]) -> dict:
        dataset_id = uuid.uuid4().hex
        paths = DatasetStore._paths(dataset_id)

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.request(method.upper(), url, headers=headers)
            r.raise_for_status()
            ctype = r.headers.get("content-type", "")
            if "application/json" in ctype or r.text.strip().startswith("["):
                data = r.json()
                df = pd.json_normalize(data)
            else:
                df = pd.read_csv(io.StringIO(r.text))

        df.to_csv(paths["csv"], index=False)
        meta = {
            "dataset_id": dataset_id,
            "name": name,
            "source": "api",
            "url": url,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        with open(paths["meta"], "w", encoding="utf-8") as f:
            json.dump(meta, f)
        return meta

    @staticmethod
    async def from_db(name: str, connection_url: str, sql: str) -> dict:
        dataset_id = uuid.uuid4().hex
        paths = DatasetStore._paths(dataset_id)

        q = sql.strip()
        if not q.lower().startswith("select"):
            raise ValueError("Only SELECT queries are allowed")
        if len(q) > 4000:
            raise ValueError("SQL too long")

        engine = create_engine(connection_url)
        try:
            df = pd.read_sql_query(q, engine)
        finally:
            engine.dispose()

        df.to_csv(paths["csv"], index=False)
        meta = {
            "dataset_id": dataset_id,
            "name": name,
            "source": "db",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        with open(paths["meta"], "w", encoding="utf-8") as f:
            json.dump(meta, f)
        return meta

    @staticmethod
    async def list() -> list[dict[str, Any]]:
        base = settings.upload_dir
        if not os.path.exists(base):
            return []
        out = []
        for fn in os.listdir(base):
            if fn.endswith(".meta.json"):
                with open(os.path.join(base, fn), "r", encoding="utf-8") as f:
                    out.append(json.load(f))
        out.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return out

    @staticmethod
    def _load_df(dataset_id: str) -> pd.DataFrame | None:
        paths = DatasetStore._paths(dataset_id)
        if not os.path.exists(paths["csv"]):
            return None
        return pd.read_csv(paths["csv"])

    @staticmethod
    async def preview(dataset_id: str, limit: int = 50):
        df = DatasetStore._load_df(dataset_id)
        if df is None:
            return None
        return {
            "columns": list(df.columns),
            "rows": df.head(limit).where(pd.notnull(df), None).to_dict(orient="records"),
            "total_rows": int(df.shape[0]),
        }

    @staticmethod
    async def summary(dataset_id: str):
        df = DatasetStore._load_df(dataset_id)
        if df is None:
            return None
        return dataset_summary(df)

    @staticmethod
    async def load_df(dataset_id: str) -> pd.DataFrame:
        df = DatasetStore._load_df(dataset_id)
        if df is None:
            raise FileNotFoundError("dataset not found")
        return df

    @staticmethod
    async def save_df(dataset_id: str, df: pd.DataFrame):
        paths = DatasetStore._paths(dataset_id)
        df.to_csv(paths["csv"], index=False)
