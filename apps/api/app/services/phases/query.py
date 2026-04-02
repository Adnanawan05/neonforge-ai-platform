import pandas as pd

from app.services.datasets import DatasetStore
from app.utils.nlq import nl_to_filter


async def run_nl_query(dataset_id: str, query: str):
    df = await DatasetStore.load_df(dataset_id)
    plan = nl_to_filter(df, query)

    out = df
    if plan.get("where"):
        try:
            out = out.query(plan["where"], engine="python")
        except Exception:
            pass

    if plan.get("select"):
        cols = [c for c in plan["select"] if c in out.columns]
        if cols:
            out = out[cols]

    if plan.get("limit"):
        out = out.head(int(plan["limit"]))

    return {
        "dataset_id": dataset_id,
        "query": query,
        "plan": plan,
        "preview": {
            "columns": list(out.columns),
            "rows": out.head(50).where(pd.notnull(out), None).to_dict(orient="records"),
            "total_rows": int(out.shape[0]),
        },
    }
