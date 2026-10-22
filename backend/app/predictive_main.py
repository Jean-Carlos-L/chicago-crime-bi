import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from backend.app.routers import predict

app = FastAPI(title="Chicago Crime BI - API predictiva", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(predict.router)


@app.exception_handler(FileNotFoundError)
async def missing_artifacts(_: Request, exc: FileNotFoundError):
    return JSONResponse(status_code=503, content={"detail": "Faltan artefactos: ejecuta `make train`"})


@app.get("/health")
def health():
    return {"status": "ok"}


handler = Mangum(app)