import pandas as pd

from etl.config import ROOT
from etl.reference import COMMUNITY_AREAS

SRC = ROOT / "data" / "geo" / "community_snapshot_2026.csv"
OUT = ROOT / "data" / "geo" / "community_population.csv"


def main() -> None:
    df = pd.read_csv(SRC)[["GEOID", "GEOG", "F2020_POP"]]
    assert len(df) == 77, f"se esperaban 77 filas y hay {len(df)}"

    if set(df["GEOID"]) == set(range(1, 78)):
        df["community_area"] = df["GEOID"]
    else:
        name_to_id = {v: k for k, v in COMMUNITY_AREAS.items()}
        df["community_area"] = df["GEOG"].str.strip().str.upper().map(name_to_id)
        missing = df[df["community_area"].isna()]["GEOG"].tolist()
        assert not missing, f"nombres sin coincidencia: {missing}"

    out = pd.DataFrame({
        "community_area": df["community_area"].astype(int),
        "population": df["F2020_POP"].astype(int),
        "source_year": 2020,
    }).sort_values("community_area")

    assert out["community_area"].is_unique and len(out) == 77
    print(f"Población total: {out['population'].sum():,}")   # debe rondar 2,7 millones
    out.to_csv(OUT, index=False)


if __name__ == "__main__":
    main()