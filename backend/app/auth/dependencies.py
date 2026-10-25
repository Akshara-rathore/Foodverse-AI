from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from app.auth.security import decode_access_token
from app.database import get_collection

security = HTTPBearer(auto_error=False)

GUEST_USER = {
    "_id": "guest_user_foodverse",
    "id": "guest_user_foodverse",
    "name": "Guest Chef",
    "email": "guest@foodverse.ai",
    "dietary_preferences": ["Balanced", "Mediterranean"],
    "allergies": [],
    "daily_calorie_target": 2100
}

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Retrieve authenticated user if token present; else returns Guest Chef."""
    if not credentials or not credentials.credentials:
        return GUEST_USER

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return GUEST_USER

    user_id = payload["sub"]
    users_col = get_collection("users")
    user = await users_col.find_one({"_id": user_id})
    if not user:
        user = await users_col.find_one({"email": payload.get("email")})

    if not user:
        return GUEST_USER

    user["id"] = str(user.get("_id", user_id))
    return user

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Requires valid JWT authentication."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload["sub"]
    users_col = get_collection("users")
    user = await users_col.find_one({"_id": user_id})
    if not user:
        user = await users_col.find_one({"email": payload.get("email")})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )

    user["id"] = str(user.get("_id", user_id))
    return user
