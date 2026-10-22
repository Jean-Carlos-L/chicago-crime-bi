# etl/load_redshift.py
import time

import boto3
import pandas as pd

from etl.config import (AWS_PROFILE, AWS_REGION, REDSHIFT_DATABASE,
                        REDSHIFT_WORKGROUP, S3_BUCKET, S3_PREFIX, SQL_DIR)
from etl.load_s3 import COLUMNS
from etl.transform import STAR_DIR

# Dimensiones primero, hechos al final
LOAD_ORDER = ["dim_date", "dim_time", "dim_location", "dim_crime_type",
              "dim_location_description", "fact_crime", "ref_community_population"]

session = boto3.Session(profile_name=AWS_PROFILE, region_name=AWS_REGION)
client = session.client("redshift-data")
TARGET = {"WorkgroupName": REDSHIFT_WORKGROUP, "Database": REDSHIFT_DATABASE}


def _wait(statement_id: str) -> dict:
    while True:
        d = client.describe_statement(Id=statement_id)
        if d["Status"] in ("FINISHED", "FAILED", "ABORTED"):
            break
        time.sleep(1)
    if d["Status"] != "FINISHED":
        raise RuntimeError(f"{d['Status']}: {d.get('Error')}\nSQL: {d.get('QueryString', '')[:300]}")
    return d


def query(sql: str) -> list[list]:
    """Ejecuta una sentencia y devuelve las filas como listas de valores Python."""
    d = _wait(client.execute_statement(Sql=sql.strip().rstrip(";"), **TARGET)["Id"])
    if not d.get("HasResultSet"):
        return []
    records = client.get_statement_result(Id=d["Id"])["Records"]
    return [[None if c.get("isNull") else next(iter(c.values())) for c in row]
            for row in records]


def run_script(path) -> None:
    """Ejecuta un .sql con varias sentencias en una sola transacción (batch)."""
    text = "\n".join(l for l in path.read_text().splitlines() if not l.strip().startswith("--"))
    statements = [s.strip() for s in text.split(";") if s.strip()]
    _wait(client.batch_execute_statement(Sqls=statements, **TARGET)["Id"])
    print(f"OK  {path.name} ({len(statements)} sentencias)")


def create_schema() -> None:
    for f in sorted((SQL_DIR / "ddl").glob("*.sql")):
        run_script(f)


def copy_tables() -> None:
    for t in LOAD_ORDER:
        start = time.time()
        query(f"COPY {t} FROM 's3://{S3_BUCKET}/{S3_PREFIX}/{t}/' "
              "IAM_ROLE default FORMAT AS PARQUET")
        print(f"OK  COPY {t:28} {time.time() - start:5.1f}s")


def validate() -> None:
    ok = True
    fact_local = pd.read_parquet(STAR_DIR / "fact_crime.parquet")

    # 1. Conteos contra los parquet locales
    for t in LOAD_ORDER:
        remote = int(query(f"SELECT COUNT(*) FROM {t}")[0][0])
        local = len(pd.read_parquet(STAR_DIR / f"{t}.parquet"))
        good = remote == local
        ok &= good
        print(f"{'OK  ' if good else 'FALLA'} conteo {t:28} redshift={remote:,} local={local:,}")

    # 2. Agregados contra los parquet locales
    arrests = int(query("SELECT SUM(arrest::int) FROM fact_crime")[0][0])
    nulls = int(query("SELECT COUNT(*) FROM fact_crime WHERE latitude IS NULL")[0][0])
    for label, remote, local in [
        ("arrestos", arrests, int(fact_local["arrest"].sum())),
        ("latitud nula", nulls, int(fact_local["latitude"].isna().sum())),
    ]:
        good = remote == local
        ok &= good
        print(f"{'OK  ' if good else 'FALLA'} {label:28} redshift={remote:,} local={local:,}")

    # 3. Integridad referencial y duplicados
    for name, bad in query((SQL_DIR / "validation" / "integrity.sql").read_text()):
        good = int(bad) == 0
        ok &= good
        print(f"{'OK  ' if good else 'FALLA'} {name:28} {bad}")

    assert ok, "hay validaciones fallidas"


if __name__ == "__main__":
    assert REDSHIFT_WORKGROUP, "Falta REDSHIFT_WORKGROUP en el .env"
    create_schema()
    copy_tables()
    validate()