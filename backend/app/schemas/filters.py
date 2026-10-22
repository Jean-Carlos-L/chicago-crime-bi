from typing import (Annotated, Literal)

from fastapi import Depends, HTTPException, Query

from backend.app.core.cache import cached_run


def data_bounds() -> tuple[int, int]:
    """Primer y último día con datos (viene de filters.sql)."""
    row = next(r for r in cached_run("filters") if r["kind"] == "date_range")
    return int(row["value"]), int(row["label"])


def get_filters(
    date_from: Annotated[str | None, Query(pattern=r"^\d{8}$", description="YYYYMMDD")] = None,
    date_to: Annotated[str | None, Query(pattern=r"^\d{8}$", description="YYYYMMDD")] = None,
    primary_types: Annotated[str, Query(pattern=r"^[A-Za-z ,\-]*$", description="THEFT,BATTERY")] = "",
    community_areas: Annotated[str, Query(pattern=r"^[0-9,]*$", description="8,32,25")] = "",
) -> dict:
    lo, hi = data_bounds()
    d_from = max(int(date_from), lo) if date_from else lo
    d_to = min(int(date_to), hi) if date_to else hi   # nunca más allá del último día con datos
    if d_from > d_to:
        raise HTTPException(422, "date_from no puede ser posterior a date_to")
    return {
        "date_from": str(d_from),
        "date_to": str(d_to),
        "primary_types": primary_types.upper().strip(),
        "community_areas": community_areas.strip(),
    }


Filters = Annotated[dict, Depends(get_filters)]
ZoneName = Literal["community_area", "district", "beat"]
ZoneParam = Annotated[ZoneName, Query(description="Nivel geográfico")]