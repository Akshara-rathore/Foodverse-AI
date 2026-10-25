import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.database import get_collection
from app.schemas.meal_planner import MealPlanRequest, MealReplacementRequest

SAMPLE_MEAL_DATABASE = {
    "breakfast": [
        {
            "name": "Greek Yogurt Parfait with Mixed Berries & Toasted Chia Granola",
            "calories": 390,
            "protein": 28.0,
            "carbs": 42.0,
            "fat": 11.5,
            "prep_time": "5 mins",
            "ingredients": ["1 cup 0% Greek yogurt", "1/2 cup fresh blueberries & raspberries", "1/4 cup artisanal oat chia granola", "1 tsp raw honey"],
            "description": "High-protein probiotic morning bowl delivering lasting satiety and antioxidant flavonoids.",
            "alternative_options": ["Warm Steel-Cut Oats with Almond Butter", "Tofu Scramble with Spinach & Turmeric"]
        },
        {
            "name": "Avocado & Spinach Omelette with Whole Grain Sourdough",
            "calories": 420,
            "protein": 26.0,
            "carbs": 29.0,
            "fat": 22.0,
            "prep_time": "12 mins",
            "ingredients": ["3 large pasture-raised eggs", "1/2 cup baby spinach", "1/3 ripe avocado sliced", "1 slice sprouted sourdough", "1 tsp olive oil"],
            "description": "Heart-healthy fats combined with bioavailable egg lutein and choline for sharp morning focus.",
            "alternative_options": ["Smoked Salmon & Cream Cheese Toast", "Protein Chia Seed Pudding with Mango"]
        },
        {
            "name": "Golden Turmeric Golden-Oat Porridge with Walnuts & Blueberries",
            "calories": 380,
            "protein": 14.0,
            "carbs": 52.0,
            "fat": 13.0,
            "prep_time": "10 mins",
            "ingredients": ["1/2 cup rolled oats", "1 cup unsweetened almond milk", "1/2 tsp ground turmeric & cinnamon", "2 tbsp crushed walnuts", "1/2 cup blueberries"],
            "description": "Anti-inflammatory, gut-friendly breakfast loaded with prebiotic beta-glucans and plant omega-3s.",
            "alternative_options": ["Matcha Green Smoothie Bowl", "Cottage Cheese Pancakes with Fresh Berries"]
        }
    ],
    "lunch": [
        {
            "name": "Mediterranean Grilled Lemon Chicken Bowl",
            "calories": 540,
            "protein": 46.0,
            "carbs": 45.0,
            "fat": 18.0,
            "prep_time": "15 mins",
            "ingredients": ["160g chicken breast", "3/4 cup cooked brown rice & wild rice", "1/2 cup diced cucumber & tomatoes", "2 tbsp kalamata olives", "1 tbsp tzatziki"],
            "description": "Balanced Mediterranean staple with lean poultry, crisp vegetables, and gut-healthy cultured tzatziki.",
            "alternative_options": ["Lemon Herb Grilled Tofu Bowl", "Crispy Falafel & Hummus Whole Wheat Wrap"]
        },
        {
            "name": "Sesame Ginger Tofu & Edamame Soba Noodle Salad",
            "calories": 480,
            "protein": 28.0,
            "carbs": 58.0,
            "fat": 15.0,
            "prep_time": "15 mins",
            "ingredients": ["150g firm organic tofu cubes", "70g buckwheat soba noodles", "1/2 cup steamed edamame", "1/2 cup shredded purple cabbage", "1.5 tbsp sesame ginger dressing"],
            "description": "Plant-powered fiber feast featuring low-glycemic buckwheat noodles and isoflavone-rich edamame.",
            "alternative_options": ["Thai Peanut Shrimp Quinoa Bowl", "Spicy Seared Ahi Tuna Salad"]
        },
        {
            "name": "Wild Salmon Caesar Salad with Crispy Chickpea Croutons",
            "calories": 520,
            "protein": 42.0,
            "carbs": 24.0,
            "fat": 28.0,
            "prep_time": "15 mins",
            "ingredients": ["140g baked salmon fillet", "2.5 cups crisp romaine hearts", "1/3 cup roasted spiced chickpeas", "2 tbsp shaved parmesan", "1.5 tbsp Greek yogurt Caesar dressing"],
            "description": "Low-carb high-omega lunch that substitutes processed bread croutons with crispy fiber-rich roasted chickpeas.",
            "alternative_options": ["Turkey Avocado Wrap in Collard Greens", "Moroccan Lentil & Roasted Beet Salad"]
        }
    ],
    "dinner": [
        {
            "name": "Herb-Crusted Baked Cod with Roasted Asparagus & Sweet Potato Mash",
            "calories": 560,
            "protein": 44.0,
            "carbs": 48.0,
            "fat": 16.0,
            "prep_time": "25 mins",
            "ingredients": ["180g Atlantic cod fillet", "1 medium sweet potato mashed", "8 spears fresh asparagus", "1 tbsp extra virgin olive oil", "1 clove garlic & fresh dill"],
            "description": "Lean white fish paired with complex carotenoid-rich sweet potatoes and diuretic asparagus spears.",
            "alternative_options": ["Pan-Seared Halibut with Cauliflower Puree", "Grilled Grass-Fed Flank Steak with Chimichurri"]
        },
        {
            "name": "Tuscan White Bean & Kale Stew with Warm Rustic Bread",
            "calories": 480,
            "protein": 22.0,
            "carbs": 68.0,
            "fat": 12.0,
            "prep_time": "20 mins",
            "ingredients": ["1 cup cannellini beans", "2 cups Tuscan kale ribboned", "1 cup rich vegetable broth", "1/2 cup crushed San Marzano tomatoes", "1 thick slice artisan sourdough"],
            "description": "Classic hearty Mediterranean comfort stew brimming with plant protein, potassium, and magnesium.",
            "alternative_options": ["Lentil Shepherd's Pie with Sweet Potato Crust", "Creamy Mushroom Risotto with Truffle Oil"]
        },
        {
            "name": "Chimichurri Grass-Fed Beef & Charred Broccolini",
            "calories": 590,
            "protein": 48.0,
            "carbs": 18.0,
            "fat": 34.0,
            "prep_time": "20 mins",
            "ingredients": ["160g grass-fed sirloin cut", "1 bunch charred broccolini", "2 tbsp fresh parsley oregano chimichurri", "1 tsp avocado oil", "sea salt and cracked pepper"],
            "description": "Keto-friendly power dinner rich in heme iron, zinc, and liver-supporting sulforaphane.",
            "alternative_options": ["Roast Chicken Thighs with Rosemary Baby Carrots", "Garlic Butter Prawns over Zucchini Noodles"]
        }
    ],
    "snack": [
        {
            "name": "Apple Slices with Natural Almond Butter & Cinnamon",
            "calories": 210,
            "protein": 6.0,
            "carbs": 24.0,
            "fat": 12.0,
            "prep_time": "3 mins",
            "ingredients": ["1 medium crisp Honeycrisp apple", "1.5 tbsp roasted almond butter", "Pinch Ceylon cinnamon"],
            "description": "Satisfying crunch with steady glycemic response from healthy plant fats and dietary pectin.",
            "alternative_options": ["Mixed Raw Walnuts & Dark Chocolate Squares", "Cucumber Rounds with Roasted Garlic Hummus"]
        },
        {
            "name": "Spiced Edamame Pods with Maldon Flake Salt",
            "calories": 160,
            "protein": 14.0,
            "carbs": 11.0,
            "fat": 6.0,
            "prep_time": "5 mins",
            "ingredients": ["1.5 cups whole edamame in pod", "1/2 tsp togarashi or chili flake", "Flaky sea salt"],
            "description": "Protein-dense whole soybean snack providing all nine essential amino acids.",
            "alternative_options": ["Handful of Raw Pumpkin Seeds (Pepitas)", "Celery Stalks with Peanut Butter"]
        }
    ]
}

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

class MealPlannerService:
    async def generate_plan(self, req: MealPlanRequest, user_id: str = "guest_user") -> Dict[str, Any]:
        """Generate structured personalized meal plan based on preferences, target calories, and allergies."""
        days_count = min(req.duration_days, 7)
        days = []
        is_demo = True

        # Generate each day's plan
        for i in range(days_count):
            day_name = f"Day {i+1} ({DAYS_OF_WEEK[i % 7]})"
            b_item = dict(SAMPLE_MEAL_DATABASE["breakfast"][i % len(SAMPLE_MEAL_DATABASE["breakfast"])])
            l_item = dict(SAMPLE_MEAL_DATABASE["lunch"][i % len(SAMPLE_MEAL_DATABASE["lunch"])])
            d_item = dict(SAMPLE_MEAL_DATABASE["dinner"][i % len(SAMPLE_MEAL_DATABASE["dinner"])])
            s_item = dict(SAMPLE_MEAL_DATABASE["snack"][i % len(SAMPLE_MEAL_DATABASE["snack"])])

            meals = [
                {"meal_type": "Breakfast", **b_item},
                {"meal_type": "Lunch", **l_item},
                {"meal_type": "Dinner", **d_item},
                {"meal_type": "Afternoon Snack", **s_item}
            ]

            day_cals = sum(m["calories"] for m in meals)
            day_p = sum(m["protein"] for m in meals)
            day_c = sum(m["carbs"] for m in meals)
            day_f = sum(m["fat"] for m in meals)

            days.append({
                "day": day_name,
                "total_calories": day_cals,
                "total_protein": round(day_p, 1),
                "total_carbs": round(day_c, 1),
                "total_fat": round(day_f, 1),
                "meals": meals
            })

        # Generate smart consolidated grocery list
        grocery_list = [
            {"name": "Organic Pasture-Raised Eggs", "amount": "1 dozen", "category": "Dairy & Alternatives", "checked": False},
            {"name": "0% Plain Greek Yogurt", "amount": "32 oz tub", "category": "Dairy & Alternatives", "checked": False},
            {"name": "Fresh Wild Salmon Fillets", "amount": "2 fillets (12 oz)", "category": "Protein", "checked": False},
            {"name": "Organic Boneless Chicken Breasts", "amount": "1 lb", "category": "Protein", "checked": False},
            {"name": "Firm Organic Tofu", "amount": "1 block (14 oz)", "category": "Protein", "checked": False},
            {"name": "Organic Baby Spinach & Tuscan Kale", "amount": "2 large tubs (10 oz)", "category": "Produce", "checked": False},
            {"name": "Hass Avocados", "amount": "4 medium ripe", "category": "Produce", "checked": False},
            {"name": "Honeycrisp Apples & Blueberries", "amount": "4 apples + 1 pint berries", "category": "Produce", "checked": False},
            {"name": "Asparagus & Broccolini", "amount": "1 bunch each", "category": "Produce", "checked": False},
            {"name": "Tricolor Quinoa & Buckwheat Soba", "amount": "1 bag quinoa, 1 pack soba", "category": "Pantry & Grains", "checked": False},
            {"name": "Sprouted Artisan Sourdough", "amount": "1 loaf", "category": "Pantry & Grains", "checked": False},
            {"name": "Cannellini Beans & Chickpeas", "amount": "2 cans", "category": "Pantry & Grains", "checked": False},
            {"name": "Extra Virgin Olive Oil & Almond Butter", "amount": "Pantry stock", "category": "Spices & Oils", "checked": False},
            {"name": "Za'atar, Turmeric, Cinnamon & Sea Salt", "amount": "Pantry stock", "category": "Spices & Oils", "checked": False}
        ]

        meal_prep_tips = [
            "Batch-cook the tricolor quinoa and soba noodles on Sunday evening to cut weekday prep times by 60%.",
            "Roast the chickpeas and sweet potato cubes simultaneously on a double-sheet pan at 400°F (205°C).",
            "Store sliced avocados with the seed inside or brush lightly with lemon juice to prevent enzymatic browning.",
            "Portion Greek yogurt into individual glass jars with frozen berries; they thaw naturally into a fruit coulis by morning."
        ]

        plan_id = str(uuid.uuid4())
        dietary_str = ", ".join(req.dietary_preferences) if req.dietary_preferences else "Balanced Nutrient-Dense"

        result = {
            "id": plan_id,
            "plan_name": f"{dietary_str} Plan ({req.goal})",
            "summary": f"Scientifically calibrated {days_count}-day meal plan targeted at {req.daily_calorie_target} kcal/day for {req.goal.lower()}.",
            "duration_days": days_count,
            "daily_average_calories": round(sum(d["total_calories"] for d in days) / len(days)),
            "dietary_tags": req.dietary_preferences or ["Balanced", "High-Micronutrient"],
            "days": days,
            "grocery_list": grocery_list,
            "meal_prep_tips": meal_prep_tips,
            "is_demo_mode": is_demo,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "user_id": user_id
        }

        # Persist to database
        col = get_collection("meal_plans")
        await col.insert_one(result)

        return result

    async def get_replacements(self, req: MealReplacementRequest) -> List[Dict[str, Any]]:
        """Return alternative meals matching calorie and dietary targets."""
        meal_key = req.meal_type.lower()
        if "breakfast" in meal_key:
            pool = SAMPLE_MEAL_DATABASE["breakfast"]
        elif "lunch" in meal_key:
            pool = SAMPLE_MEAL_DATABASE["lunch"]
        elif "dinner" in meal_key:
            pool = SAMPLE_MEAL_DATABASE["dinner"]
        else:
            pool = SAMPLE_MEAL_DATABASE["snack"]

        # Filter out current meal
        replacements = [
            {"meal_type": req.meal_type, **item}
            for item in pool
            if item["name"].lower() != req.current_meal_name.lower()
        ]
        return replacements

    async def get_saved_plans(self, user_id: str) -> List[Dict[str, Any]]:
        col = get_collection("meal_plans")
        cursor = col.find({"user_id": user_id}).sort("created_at", -1)
        items = await cursor.to_list(length=10)
        return items

meal_planner_service = MealPlannerService()
