from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.services.freshness_service import freshness_service

router = APIRouter(prefix="/freshness", tags=["Food Freshness Detection"])

@router.post("/analyze")
async def analyze_freshness(
    file: Optional[UploadFile] = File(None),
    preset_id: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Analyze food image or sample preset for visible bruising, discoloration, mold, wilting."""
    image_bytes = None
    filename = None
    mime_type = "image/jpeg"
    if file:
        image_bytes = await file.read()
        filename = file.filename
        mime_type = file.content_type or "image/jpeg"

    user_id = str(user.get("id", user.get("_id", "guest_user")))
    result = await freshness_service.analyze_freshness(
        image_bytes=image_bytes,
        filename=filename,
        mime_type=mime_type,
        user_id=user_id,
        preset_id=preset_id
    )
    return result

@router.get("/presets")
async def get_freshness_presets():
    """Retrieve sample freshness scans (apple, bruised banana, wilting spinach, mold risk strawberries)."""
    return freshness_service.get_presets()

@router.get("/history")
async def get_freshness_history(
    limit: int = Query(default=10, ge=1, le=50),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    return await freshness_service.get_history(user_id=user_id, limit=limit)
