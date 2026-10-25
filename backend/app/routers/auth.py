import uuid
import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any
from app.config import settings
from app.database import get_collection, db_instance
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserProfile
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/auth", tags=["Authentication & System"])

class ApiKeyUpdate(BaseModel):
    api_key: str

@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    users_col = get_collection("users")
    existing = await users_col.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "id": user_id,
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "dietary_preferences": payload.dietary_preferences or [],
        "allergies": payload.allergies or [],
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    await users_col.insert_one(user_doc)

    token = create_access_token({"sub": user_id, "email": user_doc["email"]})
    user_profile = {
        "id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "dietary_preferences": user_doc["dietary_preferences"],
        "allergies": user_doc["allergies"]
    }
    return {"access_token": token, "token_type": "bearer", "user": user_profile}

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    users_col = get_collection("users")
    user = await users_col.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    user_id = str(user.get("_id", user.get("id")))
    token = create_access_token({"sub": user_id, "email": user["email"]})
    user_profile = {
        "id": user_id,
        "name": user.get("name", "Chef"),
        "email": user["email"],
        "dietary_preferences": user.get("dietary_preferences", []),
        "allergies": user.get("allergies", [])
    }
    return {"access_token": token, "token_type": "bearer", "user": user_profile}

@router.get("/me")
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "id": current_user.get("id", current_user.get("_id")),
        "name": current_user.get("name", "Chef"),
        "email": current_user.get("email"),
        "dietary_preferences": current_user.get("dietary_preferences", []),
        "allergies": current_user.get("allergies", []),
        "created_at": current_user.get("created_at")
    }

@router.get("/status")
async def get_system_status():
    """Returns AI engine status (Live vs Demo) and database connectivity."""
    return {
        "gemini_configured": gemini_service.is_live_ai_available,
        "gemini_model": gemini_service._active_model or settings.GEMINI_MODEL,
        "has_api_key": bool(settings.GEMINI_API_KEY),
        "database_connected": db_instance.is_connected_to_mongo,
        "storage_mode": "MongoDB Cluster" if db_instance.is_connected_to_mongo else "Resilient Local JSON Store",
        "demo_mode_active": not gemini_service.is_live_ai_available
    }

@router.post("/api-key")
async def update_api_key(payload: ApiKeyUpdate):
    """Allows user to set their Gemini API key directly from settings UI."""
    success = gemini_service.update_api_key(payload.api_key)
    return {
        "success": success,
        "gemini_configured": gemini_service.is_live_ai_available,
        "message": "Gemini API key updated successfully! Live AI vision is now active." if gemini_service.is_live_ai_available else "Key cleared or invalid. Running in Demo Mode with rich sample data."
    }
