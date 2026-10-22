from fastapi import APIRouter

from backend.app.schemas.filters import Filters, ZoneParam
from backend.app.services import kpis as kpis_service

router = APIRouter(prefix="/analytics", tags=["KPIs"])


@router.get("/summary")
def summary(f: Filters, zone: ZoneParam = "community_area"):
    """Todos los KPIs (1 a 11) en una sola llamada."""
    return kpis_service.build_summary(f, zone)