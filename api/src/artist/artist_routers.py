from fastapi import APIRouter, Response
from fastapi import Query as QueryParam
from fastapi.responses import FileResponse, JSONResponse
from src.artist.services.artist_service import get_artists_data_and_total, get_artists_data, get_image_content, get_image_data, get_image_type, get_video_content, get_video_data
from src.artist.models.search_request import SearchRequest
from main import API_BASE, IMAGES_DIR, RESOURCES_DIR
import json

BASE_URI = f"{API_BASE}/artist"
router = APIRouter()

@router.get(f"{BASE_URI}/data_and_total")
def search_artists(limit: int = 50, offset: int = 0, sort: str = QueryParam("{}")):
    try:
        sort_dict = json.loads(sort)
    except json.JSONDecodeError:
        sort_dict = {}
   
    req = SearchRequest(limit=limit, offset=offset, sort=sort_dict)
    res = get_artists_data_and_total(req)
    
    return JSONResponse(content=res)

@router.get(f"{BASE_URI}/data")
def search_artists_diff(limit: int = 50, offset: int = 0, sort: str = QueryParam("{}")):
    try:
        sort_dict = json.loads(sort)
    except json.JSONDecodeError:
        sort_dict = {}
   
    req = SearchRequest(limit=limit, offset=offset, sort=sort_dict)
    res = get_artists_data(req)
    
    return JSONResponse(content=res)

@router.get(f"{BASE_URI}/thumbs/{{path:path}}")
def get_thumbnails(path: str):
    image_path = str(RESOURCES_DIR / path)
    if path == 'sample':
        image_path = str(IMAGES_DIR / "sample.png")
    
    # 画像タイプを取得
    mime = get_image_type(image_path)
    
    # コンテンツを取得
    if mime.startswith("image/"):
        content = get_image_content(image_path, True)
        return Response(content=content, media_type="image/png")
    elif mime.startswith("video/"):
        content = get_video_content(image_path, True)
        return Response(content=content, media_type="image/png")
    else:
        return Response(status_code=404)

@router.get(f"{BASE_URI}/image")
def get_image(path:str, is_sample:bool=False):
    image_path = str(RESOURCES_DIR / path)
    if is_sample:
        image_path = str(IMAGES_DIR / "sample.png")
    
    # 画像タイプを取得
    mime = get_image_type(image_path)
    
    # コンテンツを取得
    if mime.startswith("image/"):
        content = get_image_data(image_path, False)
    elif mime.startswith("video/"):
        content = get_video_data(image_path, False)
    else:
        content = None
    
    return {'mime': mime, 'content': content}
