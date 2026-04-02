import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from app.services.datasets import DatasetStore


async def run_simulation(dataset_id: str, scenario_a: dict[str, float], scenario_b: dict[str, float]):
    df = await DatasetStore.load_df(dataset_id)
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(num_cols) < 2:
        return {"ok": False, "reason": "need at least 2 numeric columns"}

    y_col = num_cols[0]
    X_cols = num_cols[1: min(6, len(num_cols))]

    X = df[X_cols].fillna(0)
    y = df[y_col].fillna(y_col)

    model = LinearRegression().fit(X, y)

    def _predict(scn: dict[str, float]):
        row = {c: float(scn.get(c, float(X[c].median()))) for c in X_cols}
        pred = float(model.predict(pd.DataFrame([row]))[0])
        return {"inputs": row, "prediction": pred}

    a = _predict(scenario_a)
    b = _predict(scenario_b)

    return {
        "ok": True,
        "target_proxy": y_col,
        "features": X_cols,
        "scenario_a": a,
        "scenario_b": b,
        "delta": b["prediction"] - a["prediction"],
    }
