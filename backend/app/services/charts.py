from backend.app.core.cache import cached_run


def crime_types(f: dict, top: int) -> list[dict]:
    """Indicador 12: los N tipos más frecuentes."""
    return cached_run("by_crime_type", f)[:top]


def timeseries(f: dict, granularity: str) -> list[dict]:
    """Indicador 13: serie mensual, o anual sumando los meses."""
    rows = cached_run("timeseries", f)
    if granularity == "month":
        return rows
    by_year: dict[int, int] = {}
    for r in rows:
        by_year[r["year"]] = by_year.get(r["year"], 0) + r["total"]
    return [{"year": y, "total": t} for y, t in sorted(by_year.items())]


def map_zones(f: dict, zone: str) -> list[dict]:
    """Indicador 14: conteo por zona (mapa coroplético)."""
    return cached_run("by_zone", f, zone)


def map_points(f: dict) -> list[dict]:
    """Indicador 14: celdas de ~100 m con su conteo."""
    return cached_run("geo_grid", f)


def heatmap(f: dict) -> list[dict]:
    """Indicador 15: día de la semana x hora."""
    return cached_run("heatmap", f)