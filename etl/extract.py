import os
import time

import pandas as pd
import requests

from etl.config import COLUMNS, DATA_RAW, RAW_FILE, SINCE, SOCRATA_URL

PAGE_SIZE = 1_000_000
MAX_RETRIES = 4


def _get(params: dict, headers: dict) -> list[dict]:
    """GET con reintentos y espera creciente."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = requests.get(SOCRATA_URL, params=params, headers=headers, timeout=120)
            r.raise_for_status()
            return r.json()
        except requests.RequestException as exc:
            if attempt == MAX_RETRIES:
                raise
            wait = 2**attempt
            print(f"  Error ({exc}); reintento {attempt}/{MAX_RETRIES} en {wait}s")
            time.sleep(wait)
    return []


def expected_count(headers: dict) -> int:
    """Cuántas filas debería devolver la API con el filtro (para validar al final)."""
    params = {"$select": "count(*)", "$where": f"date >= '{SINCE}'"}
    return int(_get(params, headers)[0]["count"])


def extract() -> pd.DataFrame:
    headers = {}
    if token := os.getenv("SOCRATA_APP_TOKEN"):
        headers["X-App-Token"] = token

    total = expected_count(headers)
    print(f"Filas esperadas desde {SINCE[:10]}: {total:,}")

    frames, offset = [], 0
    while True:
        params = {
            "$select": ",".join(COLUMNS),
            "$where": f"date >= '{SINCE}'",
            "$order": "id",
            "$limit": PAGE_SIZE,
            "$offset": offset,
        }
        batch = _get(params, headers)
        if not batch:
            break
        frames.append(pd.DataFrame(batch))
        offset += len(batch)
        print(f"  Descargadas {offset:,} / {total:,}")

    df = pd.concat(frames, ignore_index=True)
    if len(df) != total:
        print(f"AVISO: se esperaban {total:,} filas y llegaron {len(df):,}")
    return df


if __name__ == "__main__":
    df = extract()
    DATA_RAW.mkdir(parents=True, exist_ok=True)
    df.to_parquet(RAW_FILE, index=False)
    print(f"Guardado: {len(df):,} filas en {RAW_FILE}")