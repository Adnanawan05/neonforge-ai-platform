import os
from datetime import datetime

import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.core.config import settings
from app.services.datasets import DatasetStore
from app.utils.stats import dataset_summary


async def export_csv(dataset_id: str) -> str:
    os.makedirs(settings.artifact_dir, exist_ok=True)
    out = os.path.join(settings.artifact_dir, f"{dataset_id}.export.csv")
    df = await DatasetStore.load_df(dataset_id)
    df.to_csv(out, index=False)
    return out


async def export_xlsx(dataset_id: str) -> str:
    os.makedirs(settings.artifact_dir, exist_ok=True)
    out = os.path.join(settings.artifact_dir, f"{dataset_id}.export.xlsx")
    df = await DatasetStore.load_df(dataset_id)
    with pd.ExcelWriter(out, engine="openpyxl") as w:
        df.to_excel(w, index=False, sheet_name="data")
    return out


async def export_pdf(dataset_id: str) -> str:
    os.makedirs(settings.artifact_dir, exist_ok=True)
    out = os.path.join(settings.artifact_dir, f"{dataset_id}.report.pdf")

    df = await DatasetStore.load_df(dataset_id)
    summ = dataset_summary(df)

    c = canvas.Canvas(out, pagesize=letter)
    w, h = letter

    c.setTitle("NeonForge Report")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(48, h - 64, "NeonForge — AI Data Report")
    c.setFont("Helvetica", 10)
    c.drawString(48, h - 82, f"Dataset: {dataset_id}")
    c.drawString(48, h - 96, f"Generated: {datetime.utcnow().isoformat()}Z")

    y = h - 130
    c.setFont("Helvetica-Bold", 12)
    c.drawString(48, y, "Summary")
    y -= 16

    c.setFont("Helvetica", 10)
    c.drawString(48, y, f"Rows: {summ['shape'][0]:,}  Columns: {summ['shape'][1]:,}")
    y -= 14
    c.drawString(48, y, f"Numeric cols: {len(summ['numeric_columns'])}  Categorical cols: {len(summ['categorical_columns'])}")
    y -= 18

    c.setFont("Helvetica-Bold", 12)
    c.drawString(48, y, "Top Missing Columns")
    y -= 16
    c.setFont("Helvetica", 10)
    for item in summ["missing_top"][:8]:
        c.drawString(56, y, f"{item['column']}: {item['missing']} missing")
        y -= 14
        if y < 72:
            c.showPage()
            y = h - 64

    c.showPage()
    c.setFont("Helvetica-Bold", 14)
    c.drawString(48, h - 64, "Preview")

    preview = df.head(18).fillna("").astype(str)
    y = h - 90
    c.setFont("Helvetica", 8)
    cols = preview.columns.tolist()[:8]
    c.drawString(48, y, " | ".join(cols))
    y -= 12
    for _, row in preview[cols].iterrows():
        c.drawString(48, y, " | ".join([str(row[c])[:18] for c in cols]))
        y -= 10
        if y < 72:
            c.showPage()
            y = h - 64

    c.save()
    return out
