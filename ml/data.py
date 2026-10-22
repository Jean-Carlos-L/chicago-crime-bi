import pandas as pd
from etl.transform import STAR_DIR

def monthly_by_type() -> pd.DataFrame:
    """Delitos por (primary_type, mes) con ceros, más una serie 'TOTAL'."""
    fact = pd.read_parquet(STAR_DIR / "fact_crime.parquet", columns=["date_key", "crime_type_key"])
    ct = pd.read_parquet(STAR_DIR / "dim_crime_type.parquet", columns=["crime_type_key", "primary_type"])
    df = fact.merge(ct, on="crime_type_key", how="left")
    df["month"] = pd.to_datetime(df["date_key"].astype(str).str[:6], format="%Y%m")

    g = df.groupby(["primary_type", "month"]).size().rename("y").reset_index()
    months = pd.date_range(g["month"].min(), g["month"].max(), freq="MS")
    idx = pd.MultiIndex.from_product([sorted(g["primary_type"].unique()), months],
                                     names=["primary_type", "month"])
    g = g.set_index(["primary_type", "month"]).reindex(idx, fill_value=0).reset_index()

    total = g.groupby("month")["y"].sum().reset_index()
    total["primary_type"] = "TOTAL"
    return pd.concat([g, total], ignore_index=True)