from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from src.common.services.common_service import load_config
from src.common.services.db_service import DBService

### パス設定 ###
ROOT_DIR        = Path(__file__).parent.parent
RESOURCES_DIR   = ROOT_DIR / ".resources"
LOGS_DIR        = RESOURCES_DIR / "logs"
BOOKMARKS_DIR   = RESOURCES_DIR / "bookmarks"
IMAGES_DIR      = RESOURCES_DIR / "images"
### API設定 ###
API_RESOURCE_DIR = Path(__file__).parent / "res"
API_BASE        = "/rest/api"
# コンフィグ読み込み
CONFIG          = load_config(API_RESOURCE_DIR / "api_config.ini")
# DB接続
DB_SERVICE      = DBService(RESOURCES_DIR / CONFIG.get("db_setting", "FILE_NAME"))

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

from src.artist.artist_routers import router as artists
app.include_router(artists)