import numpy as np
import pandas as pd


def dataset_summary(df: pd.DataFrame) -> dict:
    shape = [int(df.shape[0]), int(df.shape[1])]

    missing = df.isna().sum().sort_values(ascending=False)
    missing_top = [{"column": c, "missing": int(v)} for c, v in missing.head(12).items()]

    dtypes = []
    for c in df.columns:
        dtypes.append({"column": c, "dtype": str(df[c].dtype)})

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = [c for c in df.columns if c not in num_cols]

    numeric_profiles = []
    for c in num_cols[:10]:
        s = df[c].dropna()
        if len(s) == 0:
            continue
        numeric_profiles.append({
            "column": c,
            "min": float(s.min()),
            "max": float(s.max()),
            "mean": float(s.mean()),
            "std": float(s.std() if s.std() == s.std() else 0.0),
            "p50": float(s.quantile(0.5)),
        })

    # histogram sample for first numeric col
    hist = None
    if num_cols:
        c = num_cols[0]
        s = df[c].dropna()
        if len(s) > 0:
            bins = 18
            counts, edges = np.histogram(s, bins=bins)
            hist = {
                "column": c,
                "bins": [{"x0": float(edges[i]), "x1": float(edges[i+1]), "count": int(counts[i])} for i in range(len(counts))],
            }

    # correlation heatmap matrix (cap 10)
    corr = None
    if len(num_cols) >= 2:
        cols = num_cols[:10]
        cm = df[cols].corr(numeric_only=True).fillna(0)
        corr = {
            "columns": cols,
            "matrix": [[float(cm.loc[a, b]) for b in cols] for a in cols],
        }

    return {
        "shape": shape,
        "dtypes": dtypes,
        "missing_top": missing_top,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "numeric_profiles": numeric_profiles,
        "histogram": hist,
        "correlation": corr,
    }
