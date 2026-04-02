import numpy as np
import pandas as pd

from app.services.datasets import DatasetStore


def _pick_date_col(df: pd.DataFrame) -> str | None:
    for c in df.columns:
        if any(k in c.lower() for k in ["date", "time", "timestamp"]):
            return c
    return None


def _pick_metric(df: pd.DataFrame) -> str | None:
    nums = df.select_dtypes(include=[np.number]).columns.tolist()
    return nums[0] if nums else None


async def build_story(dataset_id: str):
    df = await DatasetStore.load_df(dataset_id)

    date_col = _pick_date_col(df)
    metric = _pick_metric(df)

    kpis = []
    kpis.append({"label": "Rows", "value": int(df.shape[0])})
    kpis.append({"label": "Columns", "value": int(df.shape[1])})
    kpis.append({"label": "Missing Cells", "value": int(df.isna().sum().sum())})
    if metric:
        s = df[metric].dropna()
        if len(s):
            kpis.append({"label": f"Avg {metric}", "value": float(s.mean())})

    trend = None
    if date_col and metric:
        try:
            d = pd.to_datetime(df[date_col], errors="coerce")
            tmp = df.copy()
            tmp[date_col] = d
            tmp = tmp.dropna(subset=[date_col])
            tmp = tmp.sort_values(date_col)
            if len(tmp) >= 10:
                g = tmp.set_index(date_col)[metric].resample("D").mean().dropna()
                if len(g) >= 6:
                    pts = g.tail(60)
                    trend = {
                        "date_col": date_col,
                        "metric": metric,
                        "points": [{"t": str(idx.date()), "v": float(val)} for idx, val in pts.items()],
                    }
        except Exception:
            trend = None

    # spotlight: top categories for first categorical column
    spotlight = None
    cat_cols = [c for c in df.columns if c not in df.select_dtypes(include=[np.number]).columns]
    if cat_cols:
        c = cat_cols[0]
        vc = df[c].astype(str).value_counts().head(8)
        spotlight = {"column": c, "bars": [{"name": k, "value": int(v)} for k, v in vc.items()]}

    # numeric constellation: mini distributions
    nums = df.select_dtypes(include=[np.number]).columns.tolist()[:6]
    constellation = []
    for c in nums:
        s = df[c].dropna()
        if len(s) < 20:
            continue
        counts, edges = np.histogram(s, bins=12)
        constellation.append({
            "column": c,
            "bins": [{"x": float((edges[i] + edges[i+1]) / 2), "y": int(counts[i])} for i in range(len(counts))],
        })

    return {
        "dataset_id": dataset_id,
        "kpis": kpis,
        "trend": trend,
        "spotlight": spotlight,
        "constellation": constellation,
    }
