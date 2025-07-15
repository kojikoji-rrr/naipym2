from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from src.common.services.common_service import upsert_favorite
from config import API_BASE

BASE_URI = f"{API_BASE}"
router = APIRouter()

@router.post(f"{BASE_URI}/favorite")
async def update_favorite(req: Request):
    body = await req.json()
    res = upsert_favorite(body.get("tagId"), body.get("favorite"), body.get("memo"))
    return JSONResponse(content=res)
