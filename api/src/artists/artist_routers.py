from fastapi import APIRouter, Response
from fastapi.responses import JSONResponse
from src.artists.services.artist_service import get_artist_master, get_artists_data_and_total, get_artists_data, get_image_content, get_image_type, get_video_content
from src.artists.models.search_request import SearchRequest
from config import API_BASE, IMAGES_DIR, RESOURCES_DIR

BASE_URI = f"{API_BASE}/artist"
router = APIRouter()

@router.get(f"{BASE_URI}/master")
def get_master():
    res = get_artist_master()
    return JSONResponse(content=res)

@router.post(f"{BASE_URI}/data_and_total")
def search_artists(request:SearchRequest):
    limit = request.limit
    page  = request.page
    sort  = request.sort
    props = request.props

    res = get_artists_data_and_total(limit, limit*page, sort, props)
    return JSONResponse(content=res)

@router.post(f"{BASE_URI}/data")
def search_artists_diff(request:SearchRequest):
    limit = request.limit
    page  = request.page
    sort  = request.sort
    props = request.props

    res = get_artists_data(limit, limit*page, sort, props)
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
