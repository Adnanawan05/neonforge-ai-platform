import re
import pandas as pd


def nl_to_filter(df: pd.DataFrame, q: str) -> dict:
    q0 = q.strip().lower()
    plan: dict = {"where": None, "select": None, "limit": 50}

    # select columns
    m = re.search(r"show\s+([a-z0-9_,\s]+)", q0)
    if m:
        cols = [c.strip() for c in m.group(1).split(",") if c.strip()]
        mapped = []
        for c in cols:
            hit = next((col for col in df.columns if col.lower() == c), None)
            if hit:
                mapped.append(hit)
        if mapped:
            plan["select"] = mapped

    # last N months/days if there's a date-like column
    date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower()]
    if date_cols:
        d = date_cols[0]
        try:
            s = pd.to_datetime(df[d], errors="coerce")
            df[d] = s
            m2 = re.search(r"last\s+(\d+)\s+(day|days|month|months)", q0)
            if m2:
                n = int(m2.group(1))
                unit = m2.group(2)
                delta = pd.Timedelta(days=n) if "day" in unit else pd.Timedelta(days=30*n)
                plan["where"] = f"`{d}` >= @df['{d}'].max() - @delta"
                plan["_delta_days"] = int(delta.days)
        except Exception:
            pass

    # simple numeric comparisons: "where price > 10"
    m3 = re.search(r"(where|with)\s+([a-zA-Z0-9_ ]+)\s*(>=|<=|=|>|<)\s*([0-9.]+)", q, re.IGNORECASE)
    if m3:
        col_like = m3.group(2).strip().lower()
        op = m3.group(3)
        val = m3.group(4)
        hit = next((c for c in df.columns if c.lower() == col_like.replace(" ", "" ) or c.lower() == col_like), None)
        if hit:
            plan["where"] = f"`{hit}` {op} {val}"

    # limit
    m4 = re.search(r"top\s+(\d+)", q0)
    if m4:
        plan["limit"] = int(m4.group(1))

    return plan
