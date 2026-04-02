import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_absolute_error, r2_score

from app.core.config import settings
from app.services.datasets import DatasetStore


def _infer_task(y: pd.Series) -> str:
    if y.nunique() <= 20 and (y.dtype == object or y.nunique() / max(1, len(y)) < 0.2):
        return "classification"
    return "regression"


async def train_models(dataset_id: str, target: str, task: str | None):
    df = await DatasetStore.load_df(dataset_id)
    if target not in df.columns:
        return {"ok": False, "reason": "target not found"}

    df = df.copy()
    y = df[target]
    X = df.drop(columns=[target])

    # keep numeric only for reliable baseline
    X = X.select_dtypes(include=[np.number]).fillna(0)
    y = y.fillna(y.mode().iloc[0] if y.nunique() < len(y) else y.median())

    if X.shape[1] < 1:
        return {"ok": False, "reason": "need numeric features; run processor or provide numeric columns"}

    inferred = _infer_task(y)
    task = task or inferred

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y if task == "classification" and y.nunique() < 50 else None)

    candidates = {}
    if task == "classification":
        candidates = {
            "linear": Pipeline([("scaler", StandardScaler()), ("m", LogisticRegression(max_iter=2000))]),
            "tree": RandomForestClassifier(n_estimators=250, random_state=42),
            "nn": Pipeline([("scaler", StandardScaler()), ("m", MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=600, random_state=42))]),
        }
    else:
        candidates = {
            "linear": Pipeline([("scaler", StandardScaler()), ("m", LinearRegression())]),
            "tree": RandomForestRegressor(n_estimators=250, random_state=42),
            "nn": Pipeline([("scaler", StandardScaler()), ("m", MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=600, random_state=42))]),
        }

    scores = {}
    best = None
    best_score = -1e18

    for name, model in candidates.items():
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        if task == "classification":
            pred_lbl = pred
            if pred.ndim > 1:
                pred_lbl = pred.argmax(axis=1)
            score = float(f1_score(y_test, pred_lbl, average="weighted", zero_division=0))
            scores[name] = {
                "accuracy": float(accuracy_score(y_test, pred_lbl)),
                "precision": float(precision_score(y_test, pred_lbl, average="weighted", zero_division=0)),
                "recall": float(recall_score(y_test, pred_lbl, average="weighted", zero_division=0)),
                "f1": score,
            }
        else:
            score = float(r2_score(y_test, pred))
            scores[name] = {
                "mae": float(mean_absolute_error(y_test, pred)),
                "r2": score,
            }
        if score > best_score:
            best_score = score
            best = name

    # feature importance (best model)
    best_model = candidates[best]
    importances = None
    try:
        if hasattr(best_model, "feature_importances_"):
            imp = best_model.feature_importances_
        elif hasattr(best_model, "named_steps") and hasattr(best_model.named_steps.get("m"), "coef_"):
            imp = np.abs(best_model.named_steps["m"].coef_).ravel()
        else:
            imp = None
        if imp is not None:
            pairs = sorted(zip(X.columns.tolist(), imp.tolist()), key=lambda x: x[1], reverse=True)[:12]
            importances = [{"feature": f, "importance": float(v)} for f, v in pairs]
    except Exception:
        importances = None

    # persist model card
    os.makedirs(settings.artifact_dir, exist_ok=True)
    card_path = os.path.join(settings.artifact_dir, f"{dataset_id}.modelcard.json")
    with open(card_path, "w", encoding="utf-8") as f:
        json.dump({"dataset_id": dataset_id, "target": target, "task": task, "best_model": best, "metrics": scores, "importances": importances}, f)

    return {
        "ok": True,
        "dataset_id": dataset_id,
        "target": target,
        "task": task,
        "best_model": best,
        "metrics": scores,
        "importances": importances,
        "model_card": card_path,
    }
