import json
import time

from backend.app.core.redshift import run

TTL_SECONDS = 300
_store: dict[str, tuple[float, list[dict]]] = {}


def cached_run(name: str, params: dict | None = None, zone: str | None = None) -> list[dict]:
    key = f"{name}|{zone}|{json.dumps(params or {}, sort_keys=True)}"
    hit = _store.get(key)
    if hit and time.time() - hit[0] < TTL_SECONDS:
        return hit[1]
    rows = run(name, params, zone)
    _store[key] = (time.time(), rows)
    return rows