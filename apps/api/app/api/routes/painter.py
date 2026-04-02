from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.painter import build_story

router = APIRouter()


class StoryReq(BaseModel):
    dataset_id: str


@router.post("/story")
async def story(req: StoryReq):
    return await build_story(req.dataset_id)
