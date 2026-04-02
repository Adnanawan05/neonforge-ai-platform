from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.processor import run_processor

router = APIRouter()


class ProcessorRequest(BaseModel):
    dataset_id: str


@router.post("/run")
async def run(req: ProcessorRequest):
    return await run_processor(req.dataset_id)
