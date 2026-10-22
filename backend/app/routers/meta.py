from fastapi import APIRouter

from backend.app.core.cache import cached_run

router = APIRouter(prefix="/analytics", tags=["Meta"])


@router.get("/filters")
def filter_options():
    rows = cached_run("filters")
    return {
        "primary_types": sorted(r["value"] for r in rows if r["kind"] == "primary_type"),
        "community_areas": sorted(
            ({"id": int(r["value"]), "name": r["label"]} for r in rows if r["kind"] == "community_area"),
            key=lambda x: x["id"]),
        "date_range": next({"min": r["value"], "max": r["label"]}
                           for r in rows if r["kind"] == "date_range"),
    }