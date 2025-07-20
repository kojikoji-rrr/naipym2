from pathlib import Path
from typing import Any, Dict, List
from sqlalchemy import text
from sqlalchemy.orm import Session
from config import API_RESOURCE_DIR, DB_SERVICE
from src.artists.models.search_request import SearchRequest
from PIL import Image
import cv2
import base64
import io
import mimetypes
import os
    
# WebP用のMIMEタイプを手動で追加
mimetypes.add_type('image/webp', '.webp')

def _build_where_clause(props: Dict[str, Any]) -> str:
    conditions = []
    
    try:
        # キーワード検索
        keyword = str(props.get('keyword', '')).strip()
        if keyword and len(keyword) <= 1000:  # 長さ制限
            keyword_conditions = []
            keyword_option = props.get('keywordOption', 0)  # 0=部分一致, 1=完全一致, 2=前方一致, 3=後方一致
            
            # 危険な文字をエスケープ
            escaped_keyword = keyword.replace("'", "''").replace("\\", "\\\\")
            
            # 検索オプションに応じてパターンを生成
            if keyword_option == 1:  # 完全一致
                search_pattern = f"'{escaped_keyword}'"
                operator = "="
            elif keyword_option == 2:  # 前方一致
                escaped_keyword = escaped_keyword.replace("%", "\\%").replace("_", "\\_")
                search_pattern = f"'{escaped_keyword}%' ESCAPE '\\'"
                operator = "LIKE"
            elif keyword_option == 3:  # 後方一致
                escaped_keyword = escaped_keyword.replace("%", "\\%").replace("_", "\\_")
                search_pattern = f"'%{escaped_keyword}' ESCAPE '\\'"
                operator = "LIKE"
            else:  # 0: 部分一致（デフォルト）
                escaped_keyword = escaped_keyword.replace("%", "\\%").replace("_", "\\_")
                search_pattern = f"'%{escaped_keyword}%' ESCAPE '\\'"
                operator = "LIKE"
            
            if props.get('keywordByMemo', False):
                keyword_conditions.append(f"result.memo {operator} {search_pattern}")
            if props.get('keywordByOtherName', False):
                keyword_conditions.append(f"result.other_names {operator} {search_pattern}")
            if props.get('keywordByTagName', False):
                keyword_conditions.append(f"result.tag {operator} {search_pattern}")
            if props.get('keywordByArtistName', False):
                keyword_conditions.append(f"result.artist_name {operator} {search_pattern}")
            if props.get('keywordByModelName', False):
                keyword_conditions.append(f"result.generate_image {operator} {search_pattern}")
            if props.get('keywordByArtistID', False):
                keyword_conditions.append(f"result.artist_id {operator} {search_pattern}")
            
            if keyword_conditions:
                conditions.append(f"({' OR '.join(keyword_conditions)})")
        
        # favorite条件
        favorite = props.get('favorite')
        if favorite is not None:
            if isinstance(favorite, bool):
                conditions.append(f"result.favorite = {1 if favorite else 0}")
        
        # domain条件
        domain_list = props.get('domain', [])
        if isinstance(domain_list, list) and domain_list:
            domain_conditions = []
            for domain in domain_list[:10]:  # 最大10件まで
                if isinstance(domain, str) and domain.strip():
                    escaped_domain = domain.strip().replace("'", "''").replace("\\", "\\\\")
                    domain_conditions.append(f"result.domain LIKE '%{escaped_domain}%'")
            if domain_conditions:
                conditions.append(f"({' OR '.join(domain_conditions)})")
        
        # BAN条件
        is_banned = props.get('isBanned')
        if is_banned is not None and isinstance(is_banned, bool):
            conditions.append(f"result.is_banned = {1 if is_banned else 0}")
        
        # DEL条件
        is_deleted = props.get('isDeleted')
        if is_deleted is not None and isinstance(is_deleted, bool):
            conditions.append(f"result.is_deleted = {1 if is_deleted else 0}")
        
        # DL済条件
        is_dled = props.get('isDled')
        if is_dled is not None and isinstance(is_dled, bool):
            if is_dled:
                conditions.append("result.original_image != '[{}]' AND result.original_image IS NOT NULL")
            else:
                conditions.append("(result.original_image = '[{}]' OR result.original_image IS NULL)")
        
        # 生成済条件
        is_gened = props.get('isGened')
        if is_gened is not None and isinstance(is_gened, bool):
            if is_gened:
                conditions.append("result.generate_image != '[{}]' AND result.generate_image IS NOT NULL")
            else:
                conditions.append("(result.generate_image = '[{}]' OR result.generate_image IS NULL)")
        
        # post数範囲（数値検証追加）
        try:
            post_count_min = max(0, int(props.get('postCountMin', 0)))
            post_count_max = min(999999, int(props.get('postCountMax', 99999)))
            if post_count_min <= post_count_max and (post_count_min > 0 or post_count_max < 99999):
                conditions.append(f"result.post_count BETWEEN {post_count_min} AND {post_count_max}")
        except (ValueError, TypeError):
            # 無効な数値の場合はスキップ
            pass
        
        return f" WHERE {' AND '.join(conditions)}" if conditions else ""
    
    except Exception as e:
        print(f"Warning: WHERE句生成エラー - {str(e)}")
        return ""

def get_artist_master():
    con = DB_SERVICE.open_session()
    result = {
        'notelist': []
    }
       
    try:
        # メモ入力リスト取得
        query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "artist_notelist_query.sql")
        notelist, rowcount = DB_SERVICE.get_query_result_by_text(con, query)
        if notelist: result['notelist'] = notelist
        
        return result
    except Exception as e:
        raise e
    finally:
        con.close()

def get_artists_data_and_total(limit:int, offset:int, sort: Dict[str,bool], props:Dict[str,Any]):
    con = DB_SERVICE.open_session()
    query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "artist_detail_query.sql")

    # WHERE句を動的生成・追加
    where_clause = _build_where_clause(props)
    query += where_clause
    
    try:
        # 総件数取得
        total = DB_SERVICE.get_query_count_by_text(con, query)
        # 結果取得
        result, rowcount = DB_SERVICE.get_query_result_by_text(con, query, sort, limit, offset)
        # 結果を辞書形式に変換
        return {'total': total, 'result': result}
    except Exception as e:
        raise e
    finally:
        con.close()

def get_artists_data(limit:int, offset:int, sort: Dict[str,bool], props:Dict[str,Any]):
    con = DB_SERVICE.open_session()
    query = DB_SERVICE.load_sql(API_RESOURCE_DIR / "artist_detail_query.sql")
    
    # WHERE句を動的生成・追加
    where_clause = _build_where_clause(props)
    query += where_clause

    try:
        # 結果取得
        result, rowcount = DB_SERVICE.get_query_result_by_text(con, query, sort, limit, offset)
        # 結果を辞書形式に変換
        return result
    except Exception as e:
        raise e
    finally:
        con.close()

def get_image_type(path: str) -> str:
    if not os.path.exists(path):
        raise FileNotFoundError(f"ファイルが見つかりません: {path}")
    
    # mimetypesで判定（strict=Falseで非標準タイプも認識）
    mime_type, _ = mimetypes.guess_type(path, strict=False)
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