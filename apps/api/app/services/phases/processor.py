import numpy as np
import pandas as pd

from app.services.datasets import DatasetStore


async def run_processor(dataset_id: str):
    df = await DatasetStore.load_df(dataset_id)

    num = df.select_dtypes(include=[np.number]).columns.tolist()
    cat = [c for c in df.columns if c not in num]

    # light feature generation
    generated = []
    if len(num) >= 2:
        a, b = num[0], num[1]
        df[f"{a}_x_{b}"] = df[a] * df[b]
        generated.append(f"{a}_x_{b}")
    for c in cat[:3]:
        df[f"{c}__len"] = df[c].astype(str).str.len()
        generated.append(f"{c}__len")

    # one-hot encode a few categoricals (cap cardinality)
    encoded = []
    for c in cat[:5]:
        if df[c].nunique() <= 20:
            d = pd.get_dummies(df[c], prefix=c)
            df = pd.concat([df.drop(columns=[c]), d], axis=1)
            encoded.append(c)

    await DatasetStore.save_df(dataset_id, df)

    return {
        "dataset_id": dataset_id,
        "generated": generated,
        "encoded": encoded,
        "columns": list(df.columns),
        "shape": [int(df.shape[0]), int(df.shape[1])],
    }
