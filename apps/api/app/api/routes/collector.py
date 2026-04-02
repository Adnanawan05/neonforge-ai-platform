from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel, Field

from app.services.datasets import DatasetStore

router = APIRouter()


class ApiIngestRequest(BaseModel):
    name: str
    url: str
    method: str = "GET"
    headers: dict[str, str] = {}


class DbIngestRequest(BaseModel):
    name: str
    connection_url: str = Field(..., description="SQLAlchemy URL, e.g. postgresql://user:pass@host:5432/db")
    sql: str = Field(..., description="SELECT query")


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    ds = await DatasetStore.from_upload(file)
    return ds


@router.post("/api")
async def ingest_api(req: ApiIngestRequest):
    ds = await DatasetStore.from_api(req.name, req.url, req.method, req.headers)
    return ds


@router.post("/db")
async def ingest_db(req: DbIngestRequest):
    ds = await DatasetStore.from_db(req.name, req.connection_url, req.sql)
    return ds
