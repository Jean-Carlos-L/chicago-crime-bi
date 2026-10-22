import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from backend.app.routers import charts, kpis, meta

app = FastAPI(title="Chicago Crime BI - API descriptiva", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)

for r in (meta.router, kpis.router, charts.router):
    app.include_router(r)


@app.exception_handler(RuntimeError)
async def redshift_error(_: Request, exc: RuntimeError):
    return JSONResponse(status_code=502, content={"detail": f"Error consultando Redshift: {exc}"})


@app.get("/health")
def health():
    return {"status": "ok"}


handler = Mangum(app)   # entrada para Lambda