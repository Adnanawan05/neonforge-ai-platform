from fastapi import APIRouter
from pydantic import BaseModel

from app.services.job_manager import JobManager

router = APIRouter()


class PipelineRunRequest(BaseModel):
    dataset_id: str
    target: str | None = None
    task: str | None = None  # 'regression'|'classification'|None


@router.post("/run")
async def run_pipeline(req: PipelineRunRequest):
    job_id = await JobManager.create_and_run(req.model_dump())
    return {"job_id": job_id}


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    return await JobManager.get(job_id)
