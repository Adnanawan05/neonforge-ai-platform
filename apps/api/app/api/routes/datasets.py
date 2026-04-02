from fastapi import APIRouter, HTTPException

from app.services.datasets import DatasetStore

router = APIRouter()

@router.get("")
async def list_datasets():
    return await DatasetStore.list()

@router.get("/{dataset_id}/summary")
async def summary(dataset_id: str):
    s = await DatasetStore.summary(dataset_id)
    if not s:
        raise HTTPException(status_code=404, detail="dataset not found")
    return s

@router.get("/{dataset_id}/preview")
async def preview(dataset_id: str, limit: int = 50):
    p = await DatasetStore.preview(dataset_id, limit=limit)
    if not p:
        raise HTTPException(status_code=404, detail="dataset not found")
    return p
