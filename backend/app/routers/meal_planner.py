from fastapi import APIRouter, Depends, Body
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.schemas.meal_planner import MealPlanRequest, MealReplacementRequest
from app.services.meal_planner_service import meal_planner_service

router = APIRouter(prefix="/meals", tags=["Personalized Meal Planner"])

@router.post("/generate")
async def generate_meal_plan(
    payload: MealPlanRequest,
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Generate structured personalized daily/weekly meal plan with grocery list."""
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    result = await meal_planner_service.generate_plan(req=payload, user_id=user_id)
    return result

@router.post("/replace")
async def replace_meal(payload: MealReplacementRequest):
    """Find alternative meals matching calorie target and dietary requirements."""
    replacements = await meal_planner_service.get_replacements(payload)
    return {
        "original_meal": payload.current_meal_name,
        "replacements": replacements
    }

@router.get("/saved")
async def get_saved_meal_plans(user: Dict[str, Any] = Depends(get_optional_current_user)):
    """Retrieve saved meal plans for user."""
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    return await meal_planner_service.get_saved_plans(user_id=user_id)
