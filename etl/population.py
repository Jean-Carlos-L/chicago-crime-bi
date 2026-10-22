import pandas as pd

from etl.config import ROOT
from etl.transform import STAR_DIR

SRC = ROOT / "data" / "geo" / "community_population.csv"


def main() -> None:
    df = pd.read_csv(SRC)[["community_area", "population", "source_year"]]
    assert set(df["community_area"]) == set(range(1, 78)), "deben estar las 77 áreas"
    assert df["community_area"].is_unique
    assert (df["population"] > 0).all()
    total = int(df["population"].sum())
    print(f"Población total: {total:,}")   # debe rondar los 2,7 millones
    df.astype("int32").to_parquet(STAR_DIR / "ref_community_population.parquet", index=False)


if __name__ == "__main__":
    main()