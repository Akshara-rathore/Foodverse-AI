from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MealPlanRequest(BaseModel):
    duration_days: int = Field(default=7, ge=1, le=14)
    daily_calorie_target: int = Field(default=2000, ge=1200, le=4500)
    dietary_preferences: List[str] = [] # Vegan, Vegetarian, Keto, Mediterranean, High-Protein, Paleo, Balanced
    allergies: List[str] = [] # Dairy, Nuts, Gluten, Shellfish, Eggs, Soy
    cuisine_preferences: List[str] = [] # Italian, Asian, Mexican, Mediterranean, Indian, American
    budget_level: str = "Moderate" # Budget-friendly, Moderate, Gourmet
    available_ingredients: Optional[List[str]] = []
    goal: str = "Healthy Maintenance" # Fat Loss, Muscle Gain, Healthy Maintenance, Athletic Performance

class MealItem(BaseModel):
    meal_type: str # Breakfast, Lunch, Dinner, Snack
    name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    prep_time: str
    ingredients: List[str]
    description: str
    alternative_options: List[str] = []

class DayPlan(BaseModel):
    day: str # Day 1 (Monday), Day 2 (Tuesday), etc.
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    meals: List[MealItem]

class GroceryCategoryItem(BaseModel):
    name: str
    amount: str
    category: str # Produce, Protein, Dairy & Alternatives, Pantry & Grains, Spices & Oils
    checked: bool = False

class MealPlanResponse(BaseModel):
    id: Optional[str] = None
    plan_name: str
    summary: str
    duration_days: int
    daily_average_calories: int
    dietary_tags: List[str]
    days: List[DayPlan]
    grocery_list: List[GroceryCategoryItem]
    meal_prep_tips: List[str]
    is_demo_mode: bool = False
    created_at: Optional[str] = None

class MealReplacementRequest(BaseModel):
    current_meal_name: str
    meal_type: str
    calorie_target: int
    dietary_preferences: List[str] = []
    allergies: List[str] = []

class MealReplacementResponse(BaseModel):
    original_meal: str
    replacement_options: List[MealItem]
