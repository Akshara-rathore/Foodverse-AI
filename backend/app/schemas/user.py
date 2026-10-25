from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    dietary_preferences: Optional[List[str]] = []
    allergies: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    daily_calorie_target: Optional[int] = 2000
    created_at: Optional[str] = None
