from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.services.nutrition_service import nutrition_service

router = APIRouter(prefix="/nutrition", tags=["Food Recognition & Nutrition"])

@router.post("/analyze")
async def analyze_nutrition(
    file: Optional[UploadFile] = File(None),
    preset_id: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Analyze food image or sample preset for full nutritional values and macros."""
    image_bytes = None
    filename = None
    mime_type = "image/jpeg"
    if file:
        image_bytes = await file.read()
        filename = file.filename
        mime_type = file.content_type or "image/jpeg"

    user_id = str(user.get("id", user.get("_id", "guest_user")))
    result = await nutrition_service.analyze_food(
        image_bytes=image_bytes,
        filename=filename,
        mime_type=mime_type,
        user_id=user_id,
        preset_id=preset_id
    )
    return result

@router.get("/presets")
async def get_nutrition_presets():
    """Retrieve curated sample food scans for demo exploration."""
    return nutrition_service.get_presets()

@router.get("/history")
async def get_nutrition_history(
    limit: int = Query(default=10, ge=1, le=50),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    return await nutrition_service.get_history(user_id=user_id, limit=limit)
