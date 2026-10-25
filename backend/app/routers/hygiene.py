from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.services.hygiene_service import hygiene_service

router = APIRouter(prefix="/hygiene", tags=["Restaurant Hygiene Monitoring"])

@router.post("/analyze")
async def analyze_hygiene(
    file: Optional[UploadFile] = File(None),
    preset_id: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Analyze kitchen and food prep images for sanitation and cross-contamination risks."""
    image_bytes = None
    filename = None
    mime_type = "image/jpeg"
    if file:
        image_bytes = await file.read()
        filename = file.filename
        mime_type = file.content_type or "image/jpeg"

    user_id = str(user.get("id", user.get("_id", "guest_user")))
    result = await hygiene_service.analyze_hygiene(
        image_bytes=image_bytes,
        filename=filename,
        mime_type=mime_type,
        user_id=user_id,
        preset_id=preset_id
    )
    return result

@router.get("/presets")
async def get_hygiene_presets():
    """Retrieve sample restaurant hygiene inspections."""
    return hygiene_service.get_presets()

@router.get("/history")
async def get_hygiene_history(
    limit: int = Query(default=10, ge=1, le=50),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    return await hygiene_service.get_history(user_id=user_id, limit=limit)
