from fastapi import APIRouter, HTTPException

from backend.app.services import predictions as svc

router = APIRouter(prefix="/predict", tags=["Predicciones"])


@router.get("/trends")
def trends():
    """Tabla: variación prevista del próximo trimestre por tipo de delito."""
    return svc.trends()


@router.get("/series/{primary_type}")
def series(primary_type: str):
    """Historia (12 meses) y pronóstico (3 meses) de un tipo, o de TOTAL."""
    s = svc.series(primary_type)
    if s is None:
        raise HTTPException(404, f"Tipo no disponible: {primary_type}")
    return s


@router.get("/metrics")
def metrics():
    """Métricas de validación del backtest."""
    return svc.metrics()