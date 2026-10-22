from concurrent.futures import ThreadPoolExecutor

from backend.app.core.cache import cached_run

ARREST_COMPARE = ("THEFT", "ROBBERY", "ASSAULT")


def _fetch_all(f: dict, zone: str) -> dict[str, list[dict]]:
    """Ejecuta las consultas en paralelo: el tiempo total es el de la más lenta."""
    jobs = {
        "summary": lambda: cached_run("summary", f),
        "variation": lambda: cached_run("variation", f),
        "types": lambda: cached_run("by_crime_type", f),
        "groups": lambda: cached_run("by_crime_group", f),
        "zones": lambda: cached_run("by_zone", f, zone),
        "rates": lambda: cached_run("rate_per_100k", f),
        "weapons": lambda: cached_run("weapons", f),
    }
    with ThreadPoolExecutor(max_workers=len(jobs)) as pool:
        futures = {k: pool.submit(fn) for k, fn in jobs.items()}
        return {k: fut.result() for k, fut in futures.items()}


def _city_rate(rates: list[dict], n_days: int) -> float | None:
    """Tasa anualizada por 100.000 hab. de toda la ciudad (indicador 9)."""
    population = sum(x["population"] for x in rates)
    if not population or not n_days:
        return None
    total = sum(x["total"] for x in rates)
    return round(total / population * 100_000 * 365 / n_days, 1)


def build_summary(f: dict, zone: str) -> dict:
    """Arma el diccionario con los KPIs 1 a 11."""
    r = _fetch_all(f, zone)

    s = r["summary"][0]
    v = r["variation"][0]
    types, zones, rates = r["types"], r["zones"], r["rates"]

    return {
        "filters": f,
        "total": s["total"],                                          # 1
        "top_crime_type": types[0] if types else None,                # 2
        "property_pct": s["property_pct"],                            # 3
        "groups": r["groups"],                                        # 4
        "variation": {                                                # 5
            "current": v["current_total"],
            "previous": v["previous_total"],
            "pct": v["variation_pct"] if v["prev_available"] else None,
            "previous_period": [v["prev_from"], v["prev_to"]],
        },
        "daily_avg": s["daily_avg"],                                  # 6
        "top_zone": zones[0] if zones else None,                      # 7
        "hotspots": zones[:5],                                        # 8
        "rate_per_100k": {                                            # 9
            "city_annualized": _city_rate(rates, s["n_days"]),
            "by_area": rates,
        },
        "arrest": {                                                   # 10
            "overall_pct": s["arrest_rate_pct"],
            "by_type": [t for t in types if t["primary_type"] in ARREST_COMPARE],
        },
        "weapons": r["weapons"],                                      # 11
    }