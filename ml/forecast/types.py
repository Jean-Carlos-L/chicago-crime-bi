# ml/forecast/types.py
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor

H = 3                 # horizonte (meses)
N_ORIGINS = 12        # orígenes de prueba (uno por mes)
STABLE_PCT = 2.0      # |variación| menor a esto = STABLE
FEATURES = ["etype", "h", "lag0", "lag1", "lag2", "mean3", "mean6", "mean12",
            "yoy", "mom", "seas", "m_sin", "m_cos"]


def _row(name, code, y, months, t, h):
    """Características conocidas en el mes de origen t para predecir t+h (escala log1p)."""
    tm = pd.Timestamp(months[t]) + pd.DateOffset(months=h)
    return {
        "name": name, "etype": code, "h": h, "t": t, "tidx": t + h, "month": tm,
        "lag0": y[t], "lag1": y[t - 1], "lag2": y[t - 2],
        "mean3": y[t - 2:t + 1].mean(),
        "mean6": y[t - 5:t + 1].mean(),
        "mean12": y[t - 11:t + 1].mean(),
        "yoy": y[t] - y[t - 12],                              # variación interanual en el origen
        "mom": y[t - 2:t + 1].mean() - y[t - 5:t - 2].mean(),  # trimestre actual vs. anterior
        "seas": y[t + h - 12],                                # mismo mes del año anterior (base)
        "m_sin": np.sin(2 * np.pi * tm.month / 12),
        "m_cos": np.cos(2 * np.pi * tm.month / 12),
        "y_true": y[t + h] if t + h < len(y) else np.nan,
    }


def build_rows(g: pd.DataFrame, codes: dict[str, int]) -> pd.DataFrame:
    """Una fila por (serie, mes de origen, horizonte). g: name, month, y."""
    rows = []
    for name, s in g.groupby("name"):
        s = s.sort_values("month")
        y, months = np.log1p(s["y"].to_numpy()), s["month"].to_numpy()
        for t in range(12, len(y)):
            rows.extend(_row(name, codes[name], y, months, t, h) for h in range(1, H + 1))
    return pd.DataFrame(rows)


def _fit(train: pd.DataFrame) -> HistGradientBoostingRegressor:
    model = HistGradientBoostingRegressor(
        max_iter=200, learning_rate=0.05, max_depth=3, min_samples_leaf=30,
        categorical_features=[FEATURES.index("etype")], random_state=0)
    # Aprende la corrección sobre la línea base (mismo mes del año anterior)
    return model.fit(train[FEATURES].to_numpy(float), train["y_true"] - train["seas"])


def backtest(rows: pd.DataFrame, n: int) -> pd.DataFrame:
    """Orígenes rodantes. En cada uno solo se entrena con objetivos ya observados."""
    parts = []
    for o in range(n - H - N_ORIGINS, n - H):
        train = rows[rows["tidx"] <= o]                    # ningún objetivo posterior al origen
        test = rows[rows["t"] == o].copy()
        model = _fit(train)
        test["pred_log"] = test["seas"] + model.predict(test[FEATURES].to_numpy(float))
        test["origin"] = o
        parts.append(test)
    d = pd.concat(parts)
    d["resid"] = d["y_true"] - d["pred_log"]
    for col, src in (("actual", "y_true"), ("pred", "pred_log"), ("naive", "seas")):
        d[col] = np.expm1(d[src])
    d["naive_yoy"] = np.expm1(d["seas"] + d["yoy"]) 
    d["last3"] = np.expm1(d["lag0"]) + np.expm1(d["lag1"]) + np.expm1(d["lag2"])
    return d


def _quarters(d: pd.DataFrame) -> pd.DataFrame:
    q = (d.groupby(["origin", "name"])
          .agg(pred=("pred", "sum"), actual=("actual", "sum"),
               naive=("naive", "sum"), naive_yoy=("naive_yoy", "sum"), last=("last3", "first"))
          .reset_index())
    for c in ("pred", "actual", "naive"):
        q[f"{c}_var"] = (q[c] / q["last"] - 1) * 100
    q["naive_yoy_var"] = (q["naive_yoy"] / q["last"] - 1) * 100
    q["resid"] = np.log(q["actual"] / q["pred"])
    return q


def summarize(d: pd.DataFrame, tier: dict[str, str]):
    """Métricas del backtest y cuantiles de error por nivel de volumen (para los intervalos)."""
    q = _quarters(d)
    move = q[q["actual_var"].abs() >= STABLE_PCT]          # solo movimientos relevantes

    def acc(col):
        return float((np.sign(move[col]) == np.sign(move["actual_var"])).mean() * 100)

    def wape(col):
        return float((q["actual"] - q[col]).abs().sum() / q["actual"].sum() * 100)

    share_up = float((move["actual_var"] > 0).mean() * 100)
    metrics = {
        "origins": N_ORIGINS, "samples": int(len(q)), "samples_with_move": int(len(move)),
        "direction_acc_pct": {
            "gbm": acc("pred_var"),
            "seasonal_naive": acc("naive_var"),
            "seasonal_naive_yoy": acc("naive_yoy_var"),  
            "always_majority_class": max(share_up, 100 - share_up),   # piso de comparación
        },
        "variation_mae_pp": {
            "gbm": float((q["pred_var"] - q["actual_var"]).abs().mean()),
            "seasonal_naive": float((q["naive_var"] - q["actual_var"]).abs().mean()),
            "seasonal_naive_yoy": float((q["naive_yoy_var"] - q["actual_var"]).abs().mean()), 
            "persistence": float(q["actual_var"].abs().mean()),       # predecir 0 % de cambio
        },
        "quarter_wape_pct": {
            "gbm": wape("pred"), "seasonal_naive": wape("naive"),
            "seasonal_naive_yoy": wape("naive_yoy"),
            "persistence": float((q["actual"] - q["last"]).abs().sum() / q["actual"].sum() * 100),
        },
    }

    d = d.assign(tier=d["name"].map(tier))
    q = q.assign(tier=q["name"].map(tier))
    qm = d.groupby(["tier", "h"])["resid"].quantile([0.1, 0.9]).unstack()
    qm.columns = ["q10", "q90"]
    qq = q.groupby("tier")["resid"].quantile([0.1, 0.9]).unstack()
    qq.columns = ["q10", "q90"]
    lo, hi = q["tier"].map(qq["q10"]), q["tier"].map(qq["q90"])
    metrics["interval80_in_sample_coverage_pct"] = float(((q["resid"] >= lo) & (q["resid"] <= hi)).mean() * 100)
    return metrics, qm, qq


def fit_forecast(rows: pd.DataFrame, n: int, tier: dict[str, str],
                 qm: pd.DataFrame, qq: pd.DataFrame):
    """Entrena con todo lo observado y pronostica desde el último mes completo."""
    model = _fit(rows[rows["tidx"] <= n - 1])
    new = rows[rows["t"] == n - 1].copy()
    new["pred_log"] = new["seas"] + model.predict(new[FEATURES].to_numpy(float))
    new["tier"] = new["name"].map(tier)
    new = new.merge(qm.reset_index(), on=["tier", "h"], how="left")

    new["forecast"] = np.expm1(new["pred_log"])
    new["lo"] = np.expm1(new["pred_log"] + new["q10"])
    new["hi"] = np.expm1(new["pred_log"] + new["q90"])
    new["last3"] = np.expm1(new["lag0"]) + np.expm1(new["lag1"]) + np.expm1(new["lag2"])
    new["year_ago"] = np.expm1(new["seas"])               # mismos meses un año antes

    monthly = new[["name", "month", "h", "forecast", "lo", "hi"]]

    t = (new.groupby("name")
            .agg(next_q=("forecast", "sum"), last_q=("last3", "first"),
                 year_ago_q=("year_ago", "sum"), tier=("tier", "first"))
            .reset_index())
    t["lo_q"] = t["next_q"] * np.exp(t["tier"].map(qq["q10"]))
    t["hi_q"] = t["next_q"] * np.exp(t["tier"].map(qq["q90"]))
    t["variation_pct"] = (t["next_q"] / t["last_q"] - 1) * 100
    t["variation_lo_pct"] = (t["lo_q"] / t["last_q"] - 1) * 100
    t["variation_hi_pct"] = (t["hi_q"] / t["last_q"] - 1) * 100
    t["vs_year_ago_pct"] = (t["next_q"] / t["year_ago_q"] - 1) * 100
    t["trend"] = np.where(t["variation_pct"] > STABLE_PCT, "UP",
                  np.where(t["variation_pct"] < -STABLE_PCT, "DOWN", "STABLE"))
    t["clear"] = (t["variation_lo_pct"] > 0) | (t["variation_hi_pct"] < 0)
    return monthly, t, model