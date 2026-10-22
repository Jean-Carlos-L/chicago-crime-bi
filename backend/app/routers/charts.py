from typing import Annotated, Literal

from fastapi import APIRouter, Query

from backend.app.schemas.filters import Filters, ZoneParam
from backend.app.services import charts as charts_service

router = APIRouter(prefix="/analytics", tags=["Gráficos"])


@router.get("/crime-types")                       # indicador 12
def crime_types(f: Filters, top: Annotated[int, Query(ge=1, le=50)] = 10):
    return charts_service.crime_types(f, top)


@router.get("/timeseries")                        # indicador 13
def timeseries(f: Filters, granularity: Literal["month", "year"] = "month"):
    return charts_service.timeseries(f, granularity)


@router.get("/map/zones")                         # indicador 14, coroplético
def map_zones(f: Filters, zone: ZoneParam = "community_area"):
    return charts_service.map_zones(f, zone)


@router.get("/map/points")                        # indicador 14, celdas
def map_points(f: Filters):
    return charts_service.map_points(f)


@router.get("/heatmap")                           # indicador 15
def heatmap(f: Filters):
    return charts_service.heatmap(f)