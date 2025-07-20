from pathlib import Path
from util import load_config
from src.common.services.db_service import DBService

### パス設定 ###
ROOT_DIR        = Path(__file__).parent.parent
RESOURCES_DIR   = ROOT_DIR / ".resources"
LOGS_DIR        = RESOURCES_DIR / "logs"
BOOKMARKS_DIR   = RESOURCES_DIR / "bookmarks"
IMAGES_DIR      = RESOURCES_DIR / "images"
DB_BACKUP_DIR   = RESOURCES_DIR / "dbbak"
PKI_DIR         = RESOURCES_DIR / "pki"

### API設定 ###
API_RESOURCE_DIR = Path(__file__).parent / "res"
API_BASE        = "/rest/api"
# コンフィグ読み込み
CONFIG          = load_config(API_RESOURCE_DIR / "api_config.ini")
# DB接続
DB_SERVICE      = DBService(RESOURCES_DIR / CONFIG.get("db_setting", "FILE_NAME"))