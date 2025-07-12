from fastapi import APIRouter, Request, Response
from fastapi import Query as QueryParam
from fastapi.responses import JSONResponse
from src.common.services.common_service import upsert_favorite
from src.artist.services.artist_service import get_artist_master, get_artists_data_and_total, get_artists_data, get_image_content, get_image_data, get_image_type, get_video_content, get_video_data
from src.artist.models.search_request import SearchRequest
from main import API_BASE, IMAGES_DIR, RESOURCES_DIR
import json

BASE_URI = f"{API_BASE}/artist"
router = APIRouter()

@router.get(f"{BASE_URI}/master")
def get_master():
    res = get_artist_master()
    return JSONResponse(content=res)

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

@router.get(f"{BASE_URI}/mime/{{path:path}}")
def get_content_type(path: str):
    image_path = str(RESOURCES_DIR / path)
    if path == 'sample':
        image_path = str(IMAGES_DIR / "sample.png")
    
    try:
        result = get_image_type(image_path)
    except Exception as e:
        result = None
    
    # 画像タイプを返却
    return result or 'none'
    
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

@router.get(f"{BASE_URI}/{{path:path}}")
def get_content(path: str):
    image_path = str(RESOURCES_DIR / path)
    if path == 'sample':
        image_path = str(IMAGES_DIR / "sample.png")
    
    # 画像タイプを取得
    mime = get_image_type(image_path)
    
    # コンテンツを取得
    if mime.startswith("image/"):
        content = get_image_content(image_path, False)
        return Response(content=content, media_type=mime)
    elif mime.startswith("video/"):
        content = get_video_content(image_path, False)
        return Response(content=content, media_type=mime)
    else:
        return Response(status_code=404)

@router.post(f"{BASE_URI}/favorite")
async def update_favorite(req: Request):
    body = await req.json()
    res = upsert_favorite(body.get("tagId"), body.get("favorite"), body.get("memo"))
    return JSONResponse(content=res)
