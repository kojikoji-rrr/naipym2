from pathlib import Path
from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.orm import Session
from main import API_RESOURCE_DIR, DB_SERVICE
from src.artist.models.search_request import SearchRequest
from PIL import Image
import cv2
import base64
import io
import mimetypes
import os
    
def get_artists_data_and_total(req:SearchRequest):
    con = DB_SERVICE.open_session()
    query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "artist_detail_query.sql")
    
    try:
        # 総件数取得
        total = DB_SERVICE.get_query_count_by_text(con, query)
        # 結果取得
        result = DB_SERVICE.get_query_result_by_text(con, query, req.sort, req.limit, req.offset)
        # 結果を辞書形式に変換
        if result:
            data = [dict(row._mapping) if hasattr(row, '_mapping') else dict(row) for row in result]
        else:
            data = []
        return {'total': total, 'result': data}
    except Exception as e:
        raise e
    finally:
        con.close()

def get_artists_data(req:SearchRequest):
    con = DB_SERVICE.open_session()
    query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "artist_detail_query.sql")
    
    try:
        # 結果取得
        result = DB_SERVICE.get_query_result_by_text(con, query, req.sort, req.limit, req.offset)
        # 結果を辞書形式に変換
        if result:
            data = [dict(row._mapping) if hasattr(row, '_mapping') else dict(row) for row in result]
        else:
            data = []
        return data
    except Exception as e:
        raise e
    finally:
        con.close()

def get_image_type(path: str) -> str:
    if not os.path.exists(path):
        raise FileNotFoundError(f"ファイルが見つかりません: {path}")
    
    mime_type, _ = mimetypes.guess_type(path)
    return mime_type or 'application/octet-stream'

def get_image_content(path: str, is_thumbnail: bool) -> bytes:
    if not is_thumbnail:
        with open(path, 'rb') as f:
            return f.read()
    else:
        img = Image.open(path)
        img.thumbnail((250, 250), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return buffer.getvalue()

def get_image_data(path: str, is_thumbnail: bool) -> str:
    content = get_image_content(path, is_thumbnail)
    return base64.b64encode(content).decode('utf-8')

def get_video_content(path: str, is_thumbnail: bool) -> bytes:
    if not is_thumbnail:
        # フルサイズ動画ファイルをそのまま返す
        with open(path, 'rb') as video_file:
            return video_file.read()
    
    # サムネイル生成
    cap = cv2.VideoCapture(path)
    try:
        success, frame = cap.read()
        if not success:
            raise ValueError("動画からフレームを読み取れませんでした。")

        # OpenCV(BGR)からPillow(RGB)へ色空間を変換
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        
        # アスペクト比を維持してリサイズ
        img.thumbnail((250, 250), Image.Resampling.LANCZOS)
        
        # PIL Imageをバイト列に変換
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return buffer.getvalue()
    finally:
        cap.release()

def get_video_data(path: str, is_thumbnail: bool) -> str:
    content = get_video_content(path, is_thumbnail)
    return base64.b64encode(content).decode('utf-8')