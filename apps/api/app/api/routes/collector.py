from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

from app.services.datasets import DatasetStore

router = APIRouter()


class ApiIngestRequest(BaseModel):
    name: str
    url: str
    method: str = "GET"
    headers: dict[str, str] = {}


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    ds = await DatasetStore.from_upload(file)
    return ds


@router.post("/api")
async def ingest_api(req: ApiIngestRequest):
    ds = await DatasetStore.from_api(req.name, req.url, req.method, req.headers)
    return ds
