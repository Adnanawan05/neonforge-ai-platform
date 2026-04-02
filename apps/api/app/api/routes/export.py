from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.phases.export import export_pdf, export_csv

router = APIRouter()


class ExportReq(BaseModel):
    dataset_id: str


@router.post("/pdf")
async def pdf(req: ExportReq):
    path = await export_pdf(req.dataset_id)
    return FileResponse(path, media_type="application/pdf", filename="neonforge-report.pdf")


@router.post("/csv")
async def csv(req: ExportReq):
    path = await export_csv(req.dataset_id)
    return FileResponse(path, media_type="text/csv", filename="neonforge-export.csv")
