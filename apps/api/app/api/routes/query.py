from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phases.query import run_nl_query

router = APIRouter()


class QueryRequest(BaseModel):
    dataset_id: str
    query: str


@router.post("")
async def query(req: QueryRequest):
    return await run_nl_query(req.dataset_id, req.query)
