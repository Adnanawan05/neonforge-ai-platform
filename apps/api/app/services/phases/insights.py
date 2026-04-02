import numpy as np
import pandas as pd

from app.services.datasets import DatasetStore


async def generate_insights(dataset_id: str):
    df = await DatasetStore.load_df(dataset_id)

    insights = []

    # dataset shape
    insights.append({
        "title": "Signal Intake",
        "text": f"Dataset contains {df.shape[0]:,} rows and {df.shape[1]:,} columns.",
        "severity": "info",
    })

    # missingness
    missing = df.isna().sum().sort_values(ascending=False)
    if missing.iloc[0] > 0:
        top = missing.head(5)
        insights.append({
            "title": "Vascular Leaks (Missing Values)",
            "text": "Top missing columns: " + ", ".join([f"{c} ({int(v)})" for c, v in top.items() if v > 0]),
            "severity": "warn",
        })

    # numeric anomalies
    num = df.select_dtypes(include=[np.number])
    anomalies = []
    for c in num.columns[:8]:
        s = num[c].dropna()
        if len(s) < 20:
            continue
        z = (s - s.mean()) / (s.std() + 1e-9)
        idx = z.abs().sort_values(ascending=False).head(3).index
        if (z.abs() > 3).any():
            anomalies.append({"column": c, "examples": [{"row": int(i), "value": float(s.loc[i]), "z": float(z.loc[i])} for i in idx]})

    if anomalies:
        insights.append({
            "title": "Anomaly Pulse",
            "text": f"Detected {len(anomalies)} numeric columns with extreme outliers (|z|>3).",
            "severity": "critical",
            "anomalies": anomalies,
        })

    # correlations
    if num.shape[1] >= 2:
        corr = num.corr(numeric_only=True)
        pairs = []
        for i, a in enumerate(corr.columns):
            for b in corr.columns[i+1:]:
                v = float(corr.loc[a, b])
                if abs(v) >= 0.75:
                    pairs.append((a, b, v))
        pairs.sort(key=lambda x: abs(x[2]), reverse=True)
        if pairs[:3]:
            top = pairs[:3]
            insights.append({
                "title": "Coupled Signals",
                "text": "Strong correlations: " + "; ".join([f"{a} ↔ {b} ({v:+.2f})" for a, b, v in top]),
                "severity": "info",
            })

    return {"dataset_id": dataset_id, "insights": insights}
