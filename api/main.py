from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import API_BASE

from src.artists.artist_routers import router as artists
from src.batch.batch_routers import router as batch
from src.tools.tools_routers import router as tools
from src.common.common_routers import router as common

app = FastAPI(
    title="Naipym2 API",
    version="1.0.0",
    description="FastAPI backend for Naipym2 project"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(artists)
app.include_router(batch)
app.include_router(tools)
app.include_router(common)