from datetime import datetime
from pathlib import Path
import shutil
from typing import Any, Dict
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from util import get_file_info
from src.common.services.webdriver_service import create_webdriver, get
from src.common.services.danbooru_service import get_post as danbooru_get_post, search_artist as danbooru_search_artist, search_tag as danbooru_search_tag
from src.common.services.gelbooru_service import get_post as gelbooru_get_post
from config import API_BASE, API_RESOURCE_DIR, DB_BACKUP_DIR, DB_SERVICE, LOGS_DIR, RESOURCES_DIR
import time

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
def search_danbooru_by_artist(keyword:str, max_page:int):
    driver = None
    driver = create_webdriver(False, True)

    try:
        soups, html_contents, artists = danbooru_search_artist(driver, keyword, max_page)

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

@router.get(f"{BASE_URI}/d_search_tag")
def search_danbooru_by_tag(keyword:str, max_page:int):
    driver = None
    driver = create_webdriver(False, True)

    try:
        soups, html_contents, tags = danbooru_search_tag(driver, keyword, max_page)

        return JSONResponse(content={
            'code': 200,
            'data': {
                'html': html_contents,
                'json': tags
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

@router.get(f"{BASE_URI}/database")
def get_tables_and_logs():
    con = DB_SERVICE.open_session()
    result = {'code': 200, 'data': [], 'logs': []}
       
    try:
        # テーブルリスト取得
        query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "tools_tablelist_query.sql")
        data, rowcount = DB_SERVICE.get_query_result_by_text(con, query)
        if data: result['data'] = data

        # ログ取得
        log_path = LOGS_DIR / 'query_result.log'
        if log_path.exists():
            with open(log_path, 'r', encoding='utf-8') as f:
                logs = [line.rstrip('\n') for line in f.readlines()]
            result['logs'] = logs

        return result
    
    except Exception as e:
        result['code'] = 500
        result['error'] = str(e)
        return result
    
    finally:
        con.close()

@router.delete(f"{BASE_URI}/database")
def delete_query_log():
    result:Dict[str, Any] = {'code': 200}
       
    try:
        log_path = LOGS_DIR / 'query_result.log'
        if log_path.exists():
            log_path.unlink()
        
        log_path.touch()

        return result
    
    except Exception as e:
        result['code'] = 500
        result['error'] = str(e)
        return result

@router.post(f"{BASE_URI}/database")
async def execute_query(request: Request):
    con = DB_SERVICE.open_session()
    log_path = LOGS_DIR / 'query_result.log'
    logs = []
    results = []
    
    try:
        # リクエストボディからJSONを取得
        body = await request.json()
        query = body.get('query', '')
        
        # ;でqueryを分割
        queries = [q.strip() for q in query.split(';') if q.strip()]
        
        # 順にSQLを処理
        for i, q in enumerate(queries, 1):
            # 実行前の時間計測
            start_time = time.time()
            
            # log_pathにログ書き込み「-- {i} 行目:\r\n{q}」 -> logsに格納
            log_msg = f"-- {i} 行目:\n{q}"
            logs.append(log_msg)
            with open(log_path, 'a', encoding='utf-8') as f:
                f.write(log_msg + '\n')
            
            try:
                # 結果取得
                result, rowcount = DB_SERVICE.get_query_result_by_text(con, q)
                
                # 実行時間計算
                elapsed_ms = int((time.time() - start_time) * 1000)
                
                if result:
                    # SELECT系の場合
                    cnt = len(result)
                    log_msg = f"{cnt} 行が {elapsed_ms}ms で返されました"
                    results.append(result)
                else:
                    # INSERT/UPDATE/DELETE系の場合
                    log_msg = f"{rowcount} 行に影響しました ({elapsed_ms}ms)"
                
                logs.append(log_msg)
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(log_msg + '\n')
                    
            except Exception as e:
                # エラーの場合はログにエラーを書き込みbreak
                elapsed_ms = int((time.time() - start_time) * 1000)
                error_msg = f"エラー ({elapsed_ms}ms): {str(e)}"
                logs.append(error_msg)
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(error_msg + '\n')
                break
                
    except Exception as e:
        error_msg = f"クエリ処理エラー: {str(e)}"
        logs.append(error_msg)
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(error_msg + '\n')
    
    finally:
        con.close()
    
    # 結果を辞書形式に変換
    return {
        'logs': logs,     # 実行結果ログ
        'result': results # selectクエリの結果
    }
