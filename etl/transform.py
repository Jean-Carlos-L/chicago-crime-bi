import holidays
import pandas as pd

from etl.clean import CLEAN_FILE
from etl.config import DATA_CLEAN
from etl.reference import COMMUNITY_AREAS

STAR_DIR = DATA_CLEAN / "star"
LOC_COLS = ["beat", "district", "ward", "community_area"]
TYPE_COLS = ["iucr", "primary_type", "description", "fbi_code"]


def make_dim(df: pd.DataFrame, cols: list[str], key: str) -> pd.DataFrame:
    """Dimensión con llave sustituta secuencial a partir de las combinaciones únicas."""
    dim = df[cols].drop_duplicates().sort_values(cols).reset_index(drop=True)
    dim.insert(0, key, range(1, len(dim) + 1))
    return dim


def build_dim_date(start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
    days = pd.date_range(start.normalize(), end.normalize(), freq="D")
    il_holidays = holidays.US(subdiv="IL", years=range(days.year.min(), days.year.max() + 1))
    d = pd.DataFrame({"full_date": days})
    d["date_key"] = d["full_date"].dt.strftime("%Y%m%d").astype(int)
    d["year"] = d["full_date"].dt.year
    d["quarter"] = d["full_date"].dt.quarter
    d["month"] = d["full_date"].dt.month
    d["month_name"] = d["full_date"].dt.month_name()
    d["week_of_year"] = d["full_date"].dt.isocalendar().week.astype(int)
    d["day_of_week"] = d["full_date"].dt.dayofweek + 1  # 1 = lunes
    d["day_name"] = d["full_date"].dt.day_name()
    d["is_weekend"] = d["day_of_week"] >= 6
    d["is_holiday"] = d["full_date"].dt.date.map(lambda x: x in il_holidays)
    return d[["date_key", "full_date", "year", "quarter", "month", "month_name",
              "week_of_year", "day_of_week", "day_name", "is_weekend", "is_holiday"]]


def build_dim_time() -> pd.DataFrame:
    t = pd.DataFrame({"time_key": range(24)})
    t["hour"] = t["time_key"]
    t["part_of_day"] = pd.cut(
        t["hour"], bins=[-1, 5, 11, 17, 23],
        labels=["MADRUGADA", "MANANA", "TARDE", "NOCHE"],
    ).astype(str)
    return t


def transform(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    df = df.copy()

    # Nulos geográficos -> -1 (se mapean a 'UNKNOWN' en la dimensión)
    for col in ["district", "ward", "community_area"]:
        df[col] = df[col].fillna(-1).astype(int)

    # --- Dimensiones ---
    dim_location = make_dim(df, LOC_COLS, "location_key")
    dim_location["community_area_name"] = (
        dim_location["community_area"].map(COMMUNITY_AREAS).fillna("UNKNOWN")
    )
    dim_crime_type = make_dim(df, TYPE_COLS, "crime_type_key")
    dim_loc_desc = make_dim(df, ["location_description"], "loc_desc_key")
    dim_date = build_dim_date(df["date"].min(), df["date"].max())
    dim_time = build_dim_time()

    # --- Hechos: se asignan llaves sustitutas con merges many-to-one ---
    n = len(df)
    fact = (
        df.merge(dim_location, on=LOC_COLS, how="left", validate="many_to_one")
          .merge(dim_crime_type, on=TYPE_COLS, how="left", validate="many_to_one")
          .merge(dim_loc_desc, on="location_description", how="left", validate="many_to_one")
    )
    assert len(fact) == n, "los merges cambiaron el número de filas"

    fact["date_key"] = fact["date"].dt.strftime("%Y%m%d").astype(int)
    fact["time_key"] = fact["date"].dt.hour
    fact = fact.rename(columns={"id": "crime_id", "date": "occurred_at"})
    fact = fact[[
        "crime_id", "case_number", "date_key", "time_key", "location_key",
        "crime_type_key", "loc_desc_key", "arrest", "domestic", "block",
        "latitude", "longitude", "occurred_at", "updated_on",
    ]]

    keys = ["date_key", "time_key", "location_key", "crime_type_key", "loc_desc_key"]
    assert fact[keys].notna().all().all(), "hay llaves foráneas nulas"
    assert fact["date_key"].isin(dim_date["date_key"]).all(), "date_key fuera de dim_date"
    for k in keys[2:]:
        fact[k] = fact[k].astype(int)

    return {
        "dim_date": dim_date,
        "dim_time": dim_time,
        "dim_location": dim_location,
        "dim_crime_type": dim_crime_type,
        "dim_location_description": dim_loc_desc,
        "fact_crime": fact,
    }


if __name__ == "__main__":
    tables = transform(pd.read_parquet(CLEAN_FILE))
    STAR_DIR.mkdir(parents=True, exist_ok=True)
    for name, t in tables.items():
        t.to_parquet(STAR_DIR / f"{name}.parquet", index=False)
        print(f"{name:28} {len(t):>10,} filas")