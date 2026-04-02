from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.ml import train_models

router = APIRouter()


class TrainRequest(BaseModel):
    dataset_id: str
    target: str
    task: str | None = None


@router.post("/train")
async def train(req: TrainRequest):
    return await train_models(req.dataset_id, req.target, req.task)
