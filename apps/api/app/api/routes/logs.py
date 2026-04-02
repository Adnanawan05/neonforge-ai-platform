from fastapi import APIRouter

from app.services.job_manager import JobManager

router = APIRouter()

@router.get("")
async def list_events(limit: int = 200):
    return await JobManager.list_events(limit=limit)
