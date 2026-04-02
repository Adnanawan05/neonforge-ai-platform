from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.insights import generate_insights

router = APIRouter()


class InsightReq(BaseModel):
    dataset_id: str


@router.post("/generate")
async def gen(req: InsightReq):
    return await generate_insights(req.dataset_id)
