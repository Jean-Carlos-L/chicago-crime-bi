# ml/train_types.py
import json

import joblib
import pandas as pd

from etl.config import ROOT
from ml.data import monthly_by_type
from ml.forecast import types as T

ART = ROOT / "ml" / "artifacts"
MIN_AVG_MONTHLY = 20
HISTORY = 12


def records(df: pd.DataFrame) -> list[dict]:
    df = df.copy()
    if "month" in df:
        df["month"] = pd.to_datetime(df["month"]).dt.strftime("%Y-%m")
    return json.loads(df.round(1).to_json(orient="records"))


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    g = monthly_by_type().rename(columns={"primary_type": "name"})

    avg = g.groupby("name")["y"].mean()
    included = sorted(avg[avg >= MIN_AVG_MONTHLY].index)
    excluded = sorted(set(avg.index) - set(included))
    g = g[g["name"].isin(included)]
    n = g["month"].nunique()
    last_month = g["month"].max()
    print(f"{len(included)} series incluidas (incl. TOTAL); excluidas: {excluded}")
    print(f"Datos hasta {last_month:%Y-%m} ({n} meses)")

    median = avg[included].median()
    tier = {k: ("high" if avg[k] >= median else "low") for k in included}
    codes = {k: i for i, k in enumerate(included)}

    rows = T.build_rows(g, codes)
    bt = T.backtest(rows, n)
    metrics, qm, qq = T.summarize(bt, tier)
    print("\nBacktest:\n", json.dumps(metrics, indent=2))

    monthly, table, model = T.fit_forecast(rows, n, tier, qm, qq)
    table["avg_monthly"] = table["name"].map(avg)

    series = {}
    for name in included:
        hist = g[g["name"] == name].sort_values("month").tail(HISTORY)[["month", "y"]]
        series[name] = {
            "history": records(hist.rename(columns={"y": "total"})),
            "forecast": records(monthly[monthly["name"] == name]
                                .drop(columns=["name", "h"]).sort_values("month")),
        }

    out = table.drop(columns=["tier", "lo_q", "hi_q"]).rename(columns={"name": "primary_type"})
    (ART / "forecast_types.json").write_text(json.dumps({
        "last_month": f"{last_month:%Y-%m}",
        "horizon": T.H,
        "stable_threshold_pct": T.STABLE_PCT,
        "table": records(out.sort_values("variation_pct", ascending=False)),
        "series": series,
        "excluded": excluded,
    }, ensure_ascii=False))
    (ART / "metrics_types.json").write_text(json.dumps(metrics, indent=2))
    joblib.dump({"model": model, "codes": codes, "tier": tier}, ART / "types_model.joblib")
    print(f"\nArtefactos en {ART}")


if __name__ == "__main__":
    main()