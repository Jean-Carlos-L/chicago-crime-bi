import pandas as pd

from etl.clean import CLEAN_FILE
from etl.transform import STAR_DIR


def load(name: str) -> pd.DataFrame:
    return pd.read_parquet(STAR_DIR / f"{name}.parquet")


def validate() -> None:
    clean = pd.read_parquet(CLEAN_FILE)
    fact = load("fact_crime")
    checks = {}

    checks["filas fact == filas clean"] = len(fact) == len(clean)
    checks["crime_id único"] = fact["crime_id"].is_unique
    checks["sin FKs huérfanas (location)"] = fact["location_key"].isin(load("dim_location")["location_key"]).all()
    checks["sin FKs huérfanas (crime_type)"] = fact["crime_type_key"].isin(load("dim_crime_type")["crime_type_key"]).all()
    checks["sin FKs huérfanas (loc_desc)"] = fact["loc_desc_key"].isin(load("dim_location_description")["loc_desc_key"]).all()
    checks["sin FKs huérfanas (date)"] = fact["date_key"].isin(load("dim_date")["date_key"]).all()
    checks["sin FKs huérfanas (time)"] = fact["time_key"].isin(load("dim_time")["time_key"]).all()
    checks["tasa de arresto igual a clean"] = abs(fact["arrest"].mean() - clean["arrest"].mean()) < 1e-9

    # Los homicidios deben coincidir tipo a tipo con el clean
    ct = load("dim_crime_type").set_index("crime_type_key")["primary_type"]
    homicidios_fact = (fact["crime_type_key"].map(ct) == "HOMICIDE").sum()
    checks["homicidios fact == clean"] = homicidios_fact == (clean["primary_type"] == "HOMICIDE").sum()

    for name, ok in checks.items():
        print(f"{'OK  ' if ok else 'FALLA'} {name}")
    assert all(checks.values()), "hay validaciones fallidas"


if __name__ == "__main__":
    validate()
    import pyarrow.parquet as pq
    import pyarrow.fs as fs

    bucket = "chicagocrimedatastack-databuckete3889a50-prjainxi3tcm"
    key = "clean/fact_crime/fact_crime.parquet"

    s3 = fs.S3FileSystem(region="us-east-1")

    table = pq.read_table(f"{bucket}/{key}", filesystem=s3)

    print(table.schema)