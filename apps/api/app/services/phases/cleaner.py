import numpy as np
import pandas as pd

from app.services.datasets import DatasetStore
from app.utils.stats import dataset_summary


async def run_cleaner(dataset_id: str):
    df = await DatasetStore.load_df(dataset_id)

    before = dataset_summary(df)

    # duplicates
    dup_before = int(df.duplicated().sum())
    df = df.drop_duplicates()

    # missing: numeric->median, categorical->mode
    for c in df.columns:
        if df[c].isna().sum() == 0:
            continue
        if pd.api.types.is_numeric_dtype(df[c]):
            med = df[c].median()
            df[c] = df[c].fillna(med)
        else:
            mode = df[c].mode(dropna=True)
            fill = mode.iloc[0] if len(mode) else "Unknown"
            df[c] = df[c].fillna(fill)

    # outliers (IQR clip for numeric)
    outlier_counts = {}
    for c in df.select_dtypes(include=[np.number]).columns:
        q1 = df[c].quantile(0.25)
        q3 = df[c].quantile(0.75)
        iqr = q3 - q1
        lo = q1 - 1.5 * iqr
        hi = q3 + 1.5 * iqr
        before_out = int(((df[c] < lo) | (df[c] > hi)).sum())
        outlier_counts[c] = before_out
        df[c] = df[c].clip(lo, hi)

    await DatasetStore.save_df(dataset_id, df)
    after = dataset_summary(df)

    return {
        "dataset_id": dataset_id,
        "duplicates_removed": dup_before,
        "outliers_clipped": outlier_counts,
        "before": before,
        "after": after,
    }
