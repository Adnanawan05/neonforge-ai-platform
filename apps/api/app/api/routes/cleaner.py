from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.cleaner import run_cleaner

router = APIRouter()


class CleanerRequest(BaseModel):
    dataset_id: str


@router.post("/run")
async def run(req: CleanerRequest):
    return await run_cleaner(req.dataset_id)
