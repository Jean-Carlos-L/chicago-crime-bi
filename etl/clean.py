import pandas as pd

from etl.config import DATA_CLEAN, RAW_FILE

CLEAN_FILE = DATA_CLEAN / "crimes_clean.parquet"

EXCLUDED_TYPES = {"NON-CRIMINAL"}
LAT_RANGE = (41.6, 42.1)
LON_RANGE = (-87.95, -87.5)


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    report = {"filas_raw": len(df)}
    df = df.copy()

    # --- Tipos ---
    df["date"] = pd.to_datetime(df["date"])
    df["updated_on"] = pd.to_datetime(df["updated_on"])
    for col in ["arrest", "domestic"]:
        df[col] = df[col].astype(str).str.lower().eq("true")
    for col in ["latitude", "longitude", "x_coordinate", "y_coordinate"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in ["district", "ward", "community_area"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")
    df["beat"] = df["beat"].astype(str).str.strip().str.zfill(4)

    # --- Texto normalizado ---
    for col in ["primary_type", "description", "location_description", "block"]:
        df[col] = df[col].astype("string").str.strip().str.upper()

    # --- Duplicados por id (conserva el más reciente) ---
    df = df.sort_values("updated_on").drop_duplicates("id", keep="last")
    report["tras_dedup_id"] = len(df)

    # --- Excluir el mes en curso (incompleto) ---
    first_incomplete = df["date"].max().to_period("M").to_timestamp()
    df = df[df["date"] < first_incomplete]
    report["corte_hasta"] = str((first_incomplete - pd.Timedelta(days=1)).date())
    report["tras_corte_mes"] = len(df)

    # --- Tipos que no son crimen ---
    df = df[~df["primary_type"].isin(EXCLUDED_TYPES)]
    report["tras_excluir_tipos"] = len(df)

    # --- Coordenadas fuera de Chicago -> nulo (la fila se conserva) ---
    bad = df["latitude"].notna() & (
        ~df["latitude"].between(*LAT_RANGE) | ~df["longitude"].between(*LON_RANGE)
    )
    df.loc[bad, ["latitude", "longitude", "x_coordinate", "y_coordinate"]] = pd.NA
    report["coords_invalidas_anuladas"] = int(bad.sum())

    # --- Nulos ---
    df["location_description"] = df["location_description"].fillna("UNKNOWN")
    # community_area, ward y district nulos se mapean a 'UNKNOWN' en transform.py

    # `year` es redundante: se derivará de `date` en dim_date
    df = df.drop(columns=["year"]).sort_values("id").reset_index(drop=True)

    # --- Chequeos ---
    assert df["id"].is_unique, "ids duplicados"
    assert df["date"].notna().all(), "fechas nulas"
    assert df["primary_type"].notna().all(), "primary_type nulo"

    report["filas_clean"] = len(df)
    return df, report


if __name__ == "__main__":
    raw = pd.read_parquet(RAW_FILE)
    out, rep = clean(raw)
    DATA_CLEAN.mkdir(parents=True, exist_ok=True)
    out.to_parquet(CLEAN_FILE, index=False)
    for k, v in rep.items():
        print(f"{k:28} {v:,}" if isinstance(v, int) else f"{k:28} {v}")
    print(f"Guardado en {CLEAN_FILE}")