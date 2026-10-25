import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.database import get_collection

SAMPLE_NUTRITION_PRESETS = [
    {
        "id": "preset_salmon_bowl",
        "title": "Wild Salmon & Quinoa Superfood Bowl",
        "meal_type": "Lunch / Dinner",
        "summary": "Nutrient-dense power bowl featuring oven-baked wild salmon fillet over organic tricolor quinoa, steamed broccoli florets, sliced Hass avocado, and sesame ginger drizzle.",
        "detected_items": [
            {"name": "Baked Wild Salmon Fillet", "portion": "150g", "calories": 280, "confidence": 0.96},
            {"name": "Steamed Tricolor Quinoa", "portion": "1 cup (185g)", "calories": 222, "confidence": 0.94},
            {"name": "Fresh Hass Avocado Slices", "portion": "1/2 medium (75g)", "calories": 120, "confidence": 0.98},
            {"name": "Steamed Tenderstem Broccoli", "portion": "1 cup (90g)", "calories": 35, "confidence": 0.95},
            {"name": "Sesame Ginger Vinaigrette", "portion": "1.5 tbsp (22ml)", "calories": 65, "confidence": 0.88}
        ],
        "macros": {
            "calories": 722,
            "protein": 44.5,
            "carbohydrates": 48.0,
            "fat": 38.0,
            "fiber": 11.2,
            "sugar": 3.8,
            "sodium_mg": 460
        },
        "micronutrients": [
            {"name": "Omega-3 Fatty Acids", "amount": "2.4g", "daily_value_pct": 150},
            {"name": "Vitamin D", "amount": "14.2mcg", "daily_value_pct": 71},
            {"name": "Vitamin B12", "amount": "3.8mcg", "daily_value_pct": 158},
            {"name": "Potassium", "amount": "1,120mg", "daily_value_pct": 24},
            {"name": "Iron", "amount": "4.2mg", "daily_value_pct": 23}
        ],
        "glycemic_index": "Low (GI ~35)",
        "health_score": 94,
        "health_tips": [
            "Rich in EPA/DHA Omega-3 fats that support cardiovascular health and reduce inflammation.",
            "High complete-protein profile aiding muscle synthesis and satiety.",
            "Low glycemic carbohydrates provide steady, sustained glycogen replenishment without energy spikes."
        ]
    },
    {
        "id": "preset_avocado_toast",
        "title": "Artisan Sourdough Avocado Toast with Poached Egg",
        "meal_type": "Breakfast / Brunch",
        "summary": "Crisp toasted artisan sourdough bread layered with chunky seasoned avocado mash, chili flakes, microgreens, and a soft-poached free-range egg.",
        "detected_items": [
            {"name": "Artisan Sourdough Slice", "portion": "1 thick slice (60g)", "calories": 160, "confidence": 0.97},
            {"name": "Crushed Hass Avocado", "portion": "1/2 avocado (80g)", "calories": 130, "confidence": 0.99},
            {"name": "Poached Free-Range Egg", "portion": "1 large (50g)", "calories": 72, "confidence": 0.95},
            {"name": "Microgreens & Hemp Seeds", "portion": "1 tbsp (10g)", "calories": 45, "confidence": 0.89}
        ],
        "macros": {
            "calories": 407,
            "protein": 15.8,
            "carbohydrates": 34.2,
            "fat": 24.5,
            "fiber": 8.4,
            "sugar": 1.9,
            "sodium_mg": 380
        },
        "micronutrients": [
            {"name": "Vitamin E", "amount": "3.2mg", "daily_value_pct": 21},
            {"name": "Choline", "amount": "145mg", "daily_value_pct": 26},
            {"name": "Folate", "amount": "92mcg", "daily_value_pct": 23},
            {"name": "Lutein + Zeaxanthin", "amount": "270mcg", "daily_value_pct": 45}
        ],
        "glycemic_index": "Medium-Low (GI ~42)",
        "health_score": 90,
        "health_tips": [
            "Healthy monounsaturated fats from avocado enhance absorption of fat-soluble vitamins (A, D, E, K).",
            "Sourdough fermentation yields prebiotic compounds beneficial to gut microbiota balance.",
            "Poached egg retains maximum bioavailable micronutrients without added oxidation from high-heat frying."
        ]
    },
    {
        "id": "preset_chicken_salad",
        "title": "Grilled Herb Chicken Citrus Crunch Salad",
        "meal_type": "Lunch",
        "summary": "Char-grilled herb chicken breast over crisp romaine, radicchio, sliced cucumbers, cherry tomatoes, toasted pumpkin seeds, and zesty lemon herb dressing.",
        "detected_items": [
            {"name": "Grilled Chicken Breast", "portion": "140g", "calories": 230, "confidence": 0.98},
            {"name": "Mixed Crisp Greens & Radicchio", "portion": "2 cups (120g)", "calories": 25, "confidence": 0.96},
            {"name": "Cherry Tomatoes & Cucumber", "portion": "1 cup (150g)", "calories": 30, "confidence": 0.94},
            {"name": "Toasted Pepitas (Pumpkin Seeds)", "portion": "20g", "calories": 110, "confidence": 0.91},
            {"name": "Olive Oil Lemon Herb Dressing", "portion": "1.5 tbsp", "calories": 95, "confidence": 0.90}
        ],
        "macros": {
            "calories": 490,
            "protein": 42.0,
            "carbohydrates": 16.5,
            "fat": 28.0,
            "fiber": 6.2,
            "sugar": 5.1,
            "sodium_mg": 410
        },
        "micronutrients": [
            {"name": "Vitamin C", "amount": "45mg", "daily_value_pct": 50},
            {"name": "Vitamin K", "amount": "88mcg", "daily_value_pct": 73},
            {"name": "Magnesium", "amount": "115mg", "daily_value_pct": 27},
            {"name": "Zinc", "amount": "2.8mg", "daily_value_pct": 25}
        ],
        "glycemic_index": "Low (GI ~20)",
        "health_score": 96,
        "health_tips": [
            "High lean protein to calorie ratio makes this ideal for lean muscle building and weight management.",
            "Packed with polyphenols and bioflavonoids from the varied cruciferous and leafy greens.",
            "Dressing prepared with extra-virgin olive oil delivers oleic acid and antioxidant squalene."
        ]
    }
]

class NutritionService:
    async def analyze_food(
        self,
        image_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        mime_type: Optional[str] = "image/jpeg",
        user_id: Optional[str] = "guest_user",
        preset_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze food image or sample preset."""
        # 1. Preset request
        if preset_id:
            for p in SAMPLE_NUTRITION_PRESETS:
                if p["id"] == preset_id:
                    result_data = dict(p)
                    result_data["id"] = str(uuid.uuid4())
                    result_data["is_demo_mode"] = True
                    result_data["created_at"] = datetime.datetime.utcnow().isoformat()
                    result_data["user_id"] = user_id
                    result_data["disclaimer"] = (
                        "Estimates only. Visual nutrition approximations are generated through AI algorithms "
                        "and cannot replace chemical laboratory analysis or personalized medical dietary advice."
                    )
                    history_col = get_collection("nutrition_history")
                    await history_col.insert_one(result_data)
                    return result_data

        # 2. Custom image uploaded - Check if Gemini API Key is available
        if image_bytes:
            if not gemini_service.is_live_ai_available:
                return {
                    "status": "api_key_required",
                    "error_type": "api_key_required",
                    "title": "Google Gemini API Key Required",
                    "message": "Live multimodal AI recognition for custom uploaded food images requires a Google Gemini API key. Please add your GEMINI_API_KEY in backend/.env or click 'Smart Demo Mode' in the top-right navigation bar to enter your key. (You can also select any of the sample dishes above to test the full interface).",
                    "requires_api_key": True,
                    "is_demo_mode": True,
                    "disclaimer": "Real-time image recognition requires Google Gemini credentials."
                }

            prompt = """
            You are a certified clinical nutritionist and computer vision AI.
            Analyze this food image in detail. Return ONLY a valid JSON object matching this exact schema:
            {
              "title": "Precise name of dish or dominant food items",
              "meal_type": "Breakfast / Lunch / Dinner / Snack",
              "summary": "2-sentence nutritional overview of the meal",
              "detected_items": [
                {"name": "Ingredient / portion item", "portion": "Estimated weight or portion e.g. 150g", "calories": 250, "confidence": 0.95}
              ],
              "macros": {
                "calories": 520,
                "protein": 34.0,
                "carbohydrates": 42.0,
                "fat": 20.0,
                "fiber": 7.0,
                "sugar": 4.0,
                "sodium_mg": 450
              },
              "micronutrients": [
                {"name": "Key vitamin/mineral", "amount": "15mg", "daily_value_pct": 35}
              ],
              "glycemic_index": "Low / Medium / High (with explanation)",
              "health_score": 88,
              "health_tips": [
                "Actionable tip 1",
                "Actionable tip 2"
              ]
            }
            """

            ai_result, err = await gemini_service.generate_multimodal_analysis(
                prompt=prompt,
                image_bytes=image_bytes,
                mime_type=mime_type or "image/jpeg"
            )

            if ai_result:
                result_data = dict(ai_result)
                result_data["id"] = str(uuid.uuid4())
                result_data["is_demo_mode"] = False
                result_data["created_at"] = datetime.datetime.utcnow().isoformat()
                result_data["user_id"] = user_id
                result_data["disclaimer"] = (
                    "Estimates only. Visual nutrition approximations are generated through Google Gemini AI "
                    "and cannot replace chemical laboratory bomb calorimetry or personalized medical dietary advice."
                )

                history_col = get_collection("nutrition_history")
                await history_col.insert_one(result_data)
                return result_data

            return {
                "status": "ai_error",
                "error_type": "ai_error",
                "title": "AI Recognition Error",
                "message": f"Gemini AI was unable to analyze this image. Details: {err or 'Unrecognized format'}. Please verify your API key or try another image.",
                "requires_api_key": False,
                "is_demo_mode": False
            }

        # 3. Default fallback if neither preset nor file provided
        return {
            "status": "error",
            "message": "Please upload a food image or select a sample dish.",
            "error_type": "missing_input"
        }

    async def get_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        history_col = get_collection("nutrition_history")
        cursor = history_col.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        items = await cursor.to_list(length=limit)
        return items

    def get_presets(self) -> List[Dict[str, Any]]:
        return SAMPLE_NUTRITION_PRESETS

nutrition_service = NutritionService()
