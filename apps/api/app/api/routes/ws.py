from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.job_manager import job_hub

router = APIRouter()

@router.websocket("/ws/jobs/{job_id}")
async def ws_job(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        await job_hub.attach(job_id, websocket)
    except WebSocketDisconnect:
        await job_hub.detach(job_id, websocket)
    except Exception:
        await job_hub.detach(job_id, websocket)
        raise
