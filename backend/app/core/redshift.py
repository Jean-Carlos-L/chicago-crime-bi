import os
import re
import time
from pathlib import Path

import boto3

try:                       # en local lee el .env; en Lambda las variables ya existen
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SQL_DIR = Path(os.getenv("SQL_DIR", Path(__file__).resolve().parents[3] / "sql" / "queries"))

# Lista blanca: estas expresiones se insertan en el SQL, nunca texto del usuario
ZONES = {
    "community_area": ("community_area", "community_area_name"),
    "district": ("district", "'DISTRICT ' || CAST(district AS VARCHAR)"),
    "beat": ("beat", "beat"),
}
DEFAULTS = {"date_from": "20210101", "date_to": "20991231",
            "primary_types": "ALL", "community_areas": "ALL"}

_client = None


def _redshift():
    global _client
    if _client is None:
        session = boto3.Session(profile_name=os.getenv("AWS_PROFILE") or None,
                                region_name=os.getenv("AWS_REGION", "us-east-1"))
        _client = session.client("redshift-data")
    return _client


def _load_sql(name: str, zone: str | None) -> str:
    sql = (SQL_DIR / f"{name}.sql").read_text()
    sql = sql.replace("{base}", (SQL_DIR / "_base.sql").read_text())
    if "{zone_id}" in sql:
        zone = zone or "community_area"
        if zone not in ZONES:
            raise ValueError(f"zona no válida: {zone}")
        zid, zlabel = ZONES[zone]
        sql = sql.replace("{zone_id}", zid).replace("{zone_label}", zlabel)
    return sql


def run(name: str, params: dict | None = None, zone: str | None = None) -> list[dict]:
    sql = _load_sql(name, zone)
    merged = {**DEFAULTS, **{k: v for k, v in (params or {}).items() if v is not None}}
    for k in ("primary_types", "community_areas"):
        if not str(merged[k]).strip():
            merged[k] = "ALL"   
    # La Data API rechaza parámetros que el SQL no usa: se envían solo los presentes
    used = set(re.findall(r"(?<!:):([a-z_]+)", sql))
    parameters = [{"name": k, "value": str(v)} for k, v in merged.items() if k in used]

    kwargs = {"WorkgroupName": os.environ["REDSHIFT_WORKGROUP"],
              "Database": os.environ["REDSHIFT_DATABASE"], "Sql": sql}
    if parameters:
        kwargs["Parameters"] = parameters

    c = _redshift()
    stmt_id = c.execute_statement(**kwargs)["Id"]
    while True:
        d = c.describe_statement(Id=stmt_id)
        if d["Status"] in ("FINISHED", "FAILED", "ABORTED"):
            break
        time.sleep(0.3)
    if d["Status"] != "FINISHED":
        raise RuntimeError(f"{name}: {d['Status']} {d.get('Error')}")

    rows, cols = [], None
    for page in c.get_paginator("get_statement_result").paginate(Id=stmt_id):
        cols = cols or [m["name"] for m in page["ColumnMetadata"]]
        for rec in page["Records"]:
            rows.append({col: None if v.get("isNull") else next(iter(v.values()))
                         for col, v in zip(cols, rec)})
    return rows