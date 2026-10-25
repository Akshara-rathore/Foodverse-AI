from fastapi import APIRouter, Depends, Body
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.schemas.cooking import CookingChatRequest, SubstitutionRequest
from app.services.cooking_service import cooking_service

router = APIRouter(prefix="/cooking", tags=["Smart Cooking Assistant"])

@router.post("/chat")
async def cooking_chat(
    payload: CookingChatRequest,
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Culinary assistant conversation with recipe recommendations and techniques."""
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    history_dicts = [m.model_dump() for m in payload.history] if payload.history else None
    
    response = await cooking_service.chat(
        message=payload.message,
        history=history_dicts,
        recipe_context=payload.recipe_context,
        skill_level=payload.skill_level or "Intermediate",
        user_id=user_id
    )
    return response

@router.post("/substitutions")
async def get_ingredient_substitutions(payload: SubstitutionRequest):
    """Retrieve culinary substitutions for specific ingredients."""
    return cooking_service.get_substitutions_for(payload.ingredient)

@router.post("/save-recipe")
async def save_recipe(
    recipe: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_optional_current_user)
):
    """Save recipe to user cookbook."""
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    saved = await cooking_service.save_recipe(recipe=recipe, user_id=user_id)
    return {"success": True, "saved_recipe": saved}

@router.get("/saved-recipes")
async def get_saved_recipes(user: Dict[str, Any] = Depends(get_optional_current_user)):
    """Retrieve saved recipes for current user."""
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    recipes = await cooking_service.get_saved_recipes(user_id=user_id)
    return recipes
