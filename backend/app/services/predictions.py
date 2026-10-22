import json
import os
from functools import lru_cache
from pathlib import Path

ART = Path(os.getenv("ARTIFACTS_DIR", Path(__file__).resolve().parents[3] / "ml" / "artifacts"))


@lru_cache
def _load(name: str) -> dict:
    return json.loads((ART / name).read_text())


def trends() -> dict:
    d = _load("forecast_types.json")
    return {k: d[k] for k in ("last_month", "horizon", "stable_threshold_pct", "table", "excluded")}


def series(primary_type: str) -> dict | None:
    return _load("forecast_types.json")["series"].get(primary_type.upper())


def metrics() -> dict:
    return _load("metrics_types.json")