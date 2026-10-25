from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DetectedFoodItem(BaseModel):
    name: str
    portion: str
    calories: float
    confidence: float

class MacroBreakdown(BaseModel):
    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: float
    sugar: Optional[float] = 0.0
    sodium_mg: Optional[float] = 0.0

class MicronutrientItem(BaseModel):
    name: str
    amount: str
    daily_value_pct: int

class NutritionAnalysisResponse(BaseModel):
    id: Optional[str] = None
    title: str
    meal_type: str = "Meal"
    summary: str
    detected_items: List[DetectedFoodItem]
    macros: MacroBreakdown
    micronutrients: List[MicronutrientItem] = []
    glycemic_index: str = "Medium"
    health_score: int = Field(default=85, ge=0, le=100)
    health_tips: List[str] = []
    is_demo_mode: bool = False
    disclaimer: str = (
        "Estimates only. Visual nutrition approximations are generated through AI and cannot replace laboratory analysis or medical dietary advice."
    )
    created_at: Optional[str] = None
    image_url: Optional[str] = None
