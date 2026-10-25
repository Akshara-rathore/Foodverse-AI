from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class CookingChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    recipe_context: Optional[str] = None
    skill_level: Optional[str] = "Intermediate" # Beginner, Intermediate, Pro

class RecipeStep(BaseModel):
    step_number: int
    instruction: str
    timer_seconds: Optional[int] = None
    pro_tip: Optional[str] = None

class RecipeDetail(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    cuisine: str
    prep_time: str
    cook_time: str
    servings: int
    calories_per_serving: int
    difficulty: str # Easy, Medium, Advanced
    dietary_tags: List[str] = []
    ingredients: List[str]
    equipment_needed: List[str] = []
    steps: List[RecipeStep]
    chef_notes: List[str] = []
    is_saved: Optional[bool] = False

class CookingChatResponse(BaseModel):
    reply: str
    suggested_recipe: Optional[RecipeDetail] = None
    suggested_substitutions: Optional[List[Dict[str, str]]] = None
    quick_suggestions: List[str] = []
    is_demo_mode: bool = False

class SubstitutionRequest(BaseModel):
    ingredient: str
    dish: Optional[str] = None
    reason: Optional[str] = "Allergy / Out of stock"

class SubstitutionOption(BaseModel):
    substitute: str
    ratio: str
    flavor_impact: str
    best_used_for: str

class SubstitutionResponse(BaseModel):
    original_ingredient: str
    options: List[SubstitutionOption]
    cooking_tips: List[str]
    is_demo_mode: bool = False
