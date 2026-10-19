import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = ROOT / "data" / "raw"
DATA_CLEAN = ROOT / "data" / "clean"

SOCRATA_URL = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
SINCE = "2021-01-01T00:00:00"
RAW_FILE = DATA_RAW / "crimes_2021_present.parquet"

# Columnas a descargar. Se excluye `location` (objeto anidado redundante con
# latitude/longitude) porque complica el parquet.
COLUMNS = [
   "id", "case_number", "date", "block", "iucr", "primary_type",
   "description", "location_description", "arrest", "domestic",
   "beat", "district", "ward", "community_area", "fbi_code",
   "x_coordinate", "y_coordinate", "year", "updated_on",
   "latitude", "longitude",
]

AWS_PROFILE = os.getenv("AWS_PROFILE")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET")
REDSHIFT_WORKGROUP = os.getenv("REDSHIFT_WORKGROUP")
REDSHIFT_DATABASE = os.getenv("REDSHIFT_DATABASE", "chicago_crime")

SQL_DIR = ROOT / "sql"
UPLOAD_DIR = DATA_CLEAN / "upload"
S3_PREFIX = "clean"