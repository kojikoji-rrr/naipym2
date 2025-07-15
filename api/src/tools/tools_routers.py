from datetime import datetime
from pathlib import Path
import shutil
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from util import get_file_info
from src.common.services.webdriver_service import create_webdriver, get
from src.common.services.danbooru_service import get_post as danbooru_get_post, search_artist as danbooru_search_artist
from src.common.services.gelbooru_service import get_post as gelbooru_get_post
from config import API_BASE, DB_BACKUP_DIR, RESOURCES_DIR

BASE_URI = f"{API_BASE}/tools"
router = APIRouter()

@router.get(f"{BASE_URI}/fetch")
def fetch(target:str):
    driver = None
    driver = create_webdriver(False, True)

    try:
        if 'danbooru.donmai.us/posts' in target:
            soup, html_content, post_data = danbooru_get_post(driver, target)
        elif 'https://gelbooru.com/index.php?page=post' in target:
            soup, html_content, post_data = gelbooru_get_post(driver, target)
        else:
            soup = get(driver, target)
            post_data = None
            html_content = driver.page_source
        
        return JSONResponse(content={
            'code': 200,
            'data': {
                'html': html_content, 
                'json': post_data
            }
        })
    
    except Exception as e:
        error_code = getattr(e, 'code', 500)
        error_message = getattr(e, 'message', str(e))
        return JSONResponse(content={
            'code': error_code, 
            'error': error_message
        })
    
    finally:
        driver.quit()

@router.get(f"{BASE_URI}/d_search_artist")
def search_danbooru_by_artist(target:str, max_page:int):
    driver = None
    driver = create_webdriver(False, True)

    try:
        soups, html_contents, artists = danbooru_search_artist(driver, target, max_page)

        return JSONResponse(content={
            'code': 200,
            'data': {
                'html': html_contents,
                'json': artists
            }
        })
    
    except Exception as e:
        error_code = getattr(e, 'code', 500)
        error_message = getattr(e, 'message', str(e))
        return JSONResponse(content={
            'code': error_code, 
            'error': error_message
        })
    
    finally:
        driver.quit()

@router.get(f"{BASE_URI}/backup")
def get_backup_list():
    try:
        backup_files = []
        for file_path in DB_BACKUP_DIR.iterdir():
            fileinfo = get_file_info(file_path)
            backup_files.append(fileinfo)
        
        backup_files.sort(key=lambda x: (x["created_at"], x["filename"]))
        return backup_files
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"ファイル一覧取得エラー: {str(e)}")

@router.post(f"{BASE_URI}/backup")
def create_backup():
    now = datetime.now()

    try:
        date_str = now.strftime("%Y%m%d")
        time_str = now.strftime("%H%M%S")
        target_path = DB_BACKUP_DIR / f"sqlite.db_bak_{date_str}_{time_str}"

        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(RESOURCES_DIR/"sqlite.db", target_path)
        
        return {
            "code": 200,
            "fileinfo": get_file_info(target_path)
        }

    except Exception as e:
        return {"code": 500, "error": e}

@router.delete(f"{BASE_URI}/backup/{{filename}}")
def delete_backup(filename: str):
    try:
        file_path = DB_BACKUP_DIR / filename
        if not file_path.exists():
            return {"code": 404, "error": "ファイルが見つかりません"}
        # ファイルを削除
        file_path.unlink()
        return {"code": 200}

    except Exception as e:
        return {"code": 500, "error": str(e)}
