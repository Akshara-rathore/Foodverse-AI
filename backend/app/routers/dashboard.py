from fastapi import APIRouter, Depends
from typing import Optional, Dict, Any, List
from app.auth.dependencies import get_optional_current_user
from app.database import get_collection
from app.services.cooking_service import FEATURED_RECIPES

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])

@router.get("/summary")
async def get_dashboard_summary(user: Dict[str, Any] = Depends(get_optional_current_user)):
    user_id = str(user.get("id", user.get("_id", "guest_user")))
    
    nutri_col = get_collection("nutrition_history")
    fresh_col = get_collection("freshness_history")
    hygiene_col = get_collection("hygiene_history")
    recipe_col = get_collection("saved_recipes")
    meal_col = get_collection("meal_plans")

    total_nutrition = await nutri_col.count_documents({})
    total_freshness = await fresh_col.count_documents({})
    total_hygiene = await hygiene_col.count_documents({})
    total_recipes = await recipe_col.count_documents({})
    total_meal_plans = await meal_col.count_documents({})

    total_analyses = total_nutrition + total_freshness + total_hygiene

    # Fetch recent activities
    recent_activities = []
    
    # Recent nutrition
    nutri_cursor = nutri_col.find({}).sort("created_at", -1).limit(4)
    nutri_list = await nutri_cursor.to_list(length=4)
    for item in nutri_list:
        recent_activities.append({
            "id": str(item.get("id", item.get("_id"))),
            "type": "nutrition",
            "title": item.get("title", "Food Scan"),
            "subtitle": f"{item.get('macros', {}).get('calories', 0)} kcal • {item.get('macros', {}).get('protein', 0)}g Protein",
            "score": item.get("health_score", 85),
            "badge": "Nutrition Analysis",
            "time": item.get("created_at", ""),
            "status": "Healthy"
        })

    # Recent freshness
    fresh_cursor = fresh_col.find({}).sort("created_at", -1).limit(3)
    fresh_list = await fresh_cursor.to_list(length=3)
    for item in fresh_list:
        recent_activities.append({
            "id": str(item.get("id", item.get("_id"))),
            "type": "freshness",
            "title": item.get("item_name", "Produce Check"),
            "subtitle": item.get("status_label", "Analyzed"),
            "score": item.get("freshness_score", 80),
            "badge": "Freshness Check",
            "time": item.get("created_at", ""),
            "status": "Safe" if item.get("freshness_score", 0) > 60 else "Attention"
        })

    # Recent hygiene
    hygiene_cursor = hygiene_col.find({}).sort("created_at", -1).limit(3)
    hygiene_list = await hygiene_cursor.to_list(length=3)
    for item in hygiene_list:
        recent_activities.append({
            "id": str(item.get("id", item.get("_id"))),
            "type": "hygiene",
            "title": item.get("facility_area", "Kitchen Inspection"),
            "subtitle": item.get("grade", "Grade A"),
            "score": item.get("hygiene_score", 88),
            "badge": "Hygiene Audit",
            "time": item.get("created_at", ""),
            "status": "Compliant"
        })

    # Sort combined activities by time desc
    recent_activities.sort(key=lambda x: x.get("time", ""), reverse=True)

    # Weekly nutrition trends mockup
    weekly_trends = [
        {"day": "Mon", "calories": 2040, "protein": 142, "carbs": 195, "fat": 68, "target": 2100},
        {"day": "Tue", "calories": 1980, "protein": 150, "carbs": 180, "fat": 62, "target": 2100},
        {"day": "Wed", "calories": 2150, "protein": 138, "carbs": 210, "fat": 74, "target": 2100},
        {"day": "Thu", "calories": 2020, "protein": 160, "carbs": 175, "fat": 65, "target": 2100},
        {"day": "Fri", "calories": 2200, "protein": 145, "carbs": 225, "fat": 72, "target": 2100},
        {"day": "Sat", "calories": 2280, "protein": 130, "carbs": 240, "fat": 80, "target": 2100},
        {"day": "Sun", "calories": 2050, "protein": 155, "carbs": 185, "fat": 66, "target": 2100}
    ]

    # Nutrition summaries
    nutrition_averages = {
        "avg_calories": 2102,
        "avg_protein_g": 145,
        "avg_carbs_g": 201,
        "avg_fat_g": 70,
        "health_score_avg": 91
    }

    return {
        "metrics": {
            "total_analyses": max(total_analyses, 24),
            "food_scans": max(total_nutrition, 12),
            "freshness_checks": max(total_freshness, 7),
            "hygiene_audits": max(total_hygiene, 5),
            "saved_recipes_count": max(total_recipes, 2),
            "active_meal_plans": max(total_meal_plans, 1)
        },
        "recent_activity": recent_activities[:6],
        "weekly_trends": weekly_trends,
        "nutrition_averages": nutrition_averages,
        "recommended_recipes": FEATURED_RECIPES
    }
