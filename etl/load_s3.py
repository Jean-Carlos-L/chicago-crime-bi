# etl/load_s3.py
import boto3
import pandas as pd

from etl.config import AWS_PROFILE, AWS_REGION, S3_BUCKET, S3_PREFIX, UPLOAD_DIR
from etl.transform import STAR_DIR

# Orden de columnas = orden del DDL (COPY desde Parquet mapea por posición)
COLUMNS = {
    "dim_date": ["date_key", "full_date", "year", "quarter", "month", "month_name",
                 "week_of_year", "day_of_week", "day_name", "is_weekend", "is_holiday"],
    "dim_time": ["time_key", "hour", "part_of_day"],
    "dim_location": ["location_key", "beat", "district", "ward", "community_area",
                     "community_area_name"],
    "dim_crime_type": ["crime_type_key", "iucr", "primary_type", "description", "fbi_code"],
    "dim_location_description": ["loc_desc_key", "location_description"],
    "fact_crime": ["crime_id", "case_number", "date_key", "time_key", "location_key",
                   "crime_type_key", "loc_desc_key", "arrest", "domestic", "block",
                   "latitude", "longitude", "occurred_at", "updated_on"],
}

INT32_COLS = {
    "date_key", "year", "quarter", "month", "week_of_year", "day_of_week",
    "time_key", "hour", "location_key", "district", "ward", "community_area",
    "crime_type_key", "loc_desc_key",
}
# crime_id es BIGINT (int64) y los timestamps se escriben en microsegundos


def prepare(name: str) -> pd.DataFrame:
    df = pd.read_parquet(STAR_DIR / f"{name}.parquet")[COLUMNS[name]].copy()
    for col in INT32_COLS & set(df.columns):
        df[col] = df[col].astype("int32")
    if "full_date" in df.columns:
        df["full_date"] = df["full_date"].dt.date          # DATE
    for col in df.select_dtypes(include=["string"]).columns:
        df[col] = df[col].astype(object) 
    if "crime_id" in df.columns:
        df["crime_id"] = df["crime_id"].astype("int64")
    # VARCHAR
    return df


def main() -> None:
    assert S3_BUCKET, "Falta S3_BUCKET en el .env"
    session = boto3.Session(profile_name=AWS_PROFILE, region_name=AWS_REGION)
    bucket = session.resource("s3").Bucket(S3_BUCKET)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    for name in COLUMNS:
        df = prepare(name)
        local = UPLOAD_DIR / f"{name}.parquet"
        df.to_parquet(local, index=False, coerce_timestamps="us",
                      allow_truncated_timestamps=True)

        prefix = f"{S3_PREFIX}/{name}/"
        bucket.objects.filter(Prefix=prefix).delete()   # evita archivos viejos en el COPY
        bucket.upload_file(str(local), f"{prefix}{name}.parquet")
        print(f"{name:28} {len(df):>10,} filas -> s3://{S3_BUCKET}/{prefix}")


if __name__ == "__main__":
    main()