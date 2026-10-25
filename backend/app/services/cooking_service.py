import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.database import get_collection

COMMON_SUBSTITUTIONS = {
    "egg": [
        {"substitute": "Flax Egg (1 tbsp ground flaxseed + 3 tbsp warm water)", "ratio": "1:1 per egg", "flavor_impact": "Nutty, dense; retains moisture", "best_used_for": "Baking, pancakes, veggie burgers, brownies"},
        {"substitute": "Aquafaba (chickpea brine, whipped)", "ratio": "3 tbsp per egg white", "flavor_impact": "Neutral; creates light foam", "best_used_for": "Meringues, macarons, light cakes, mousses"},
        {"substitute": "Mashed Ripe Banana or Applesauce", "ratio": "1/4 cup per egg", "flavor_impact": "Fruity sweetness", "best_used_for": "Muffins, quick breads, oat bars"}
    ],
    "buttermilk": [
        {"substitute": "Whole Milk + 1 tbsp Fresh Lemon Juice or White Vinegar", "ratio": "1 cup milk + 1 tbsp acid", "flavor_impact": "Tangy and acidic; activates baking soda", "best_used_for": "Biscuits, pancakes, marinades, fried chicken"},
        {"substitute": "Plain Greek Yogurt thinned with water or milk", "ratio": "3/4 cup yogurt + 1/4 cup liquid", "flavor_impact": "Rich, creamy, cultured acidity", "best_used_for": "Cakes, waffle batter, ranch dressings"}
    ],
    "heavy cream": [
        {"substitute": "Full-Fat Coconut Milk / Coconut Cream", "ratio": "1:1 substitute", "flavor_impact": "Subtle coconut aroma in sweet dishes; creamy in savory curries", "best_used_for": "Curries, creamy soups, vegan ganache"},
        {"substitute": "Silken Tofu blended smooth with soy milk", "ratio": "1:1 blend", "flavor_impact": "Ultra neutral, velvety texture", "best_used_for": "Pasta Alfredo, chowders, creamy salad dressings"}
    ],
    "soy sauce": [
        {"substitute": "Coconut Aminos", "ratio": "1:1 (slightly sweeter, lower sodium)", "flavor_impact": "Umami-rich with gentle natural sweetness", "best_used_for": "Gluten-free stir-fries, marinades, sushi dipping"},
        {"substitute": "Tamari (Wheat-Free Fermented Soy)", "ratio": "1:1 substitute", "flavor_impact": "Deeper, darker, robust umami", "best_used_for": "Braises, glazed salmon, Asian dressings"}
    ],
    "butter": [
        {"substitute": "Extra Virgin Olive Oil or Avocado Oil", "ratio": "3/4 cup oil per 1 cup butter", "flavor_impact": "Fruity, rich monounsaturated fats", "best_used_for": "Sautéing, roasting vegetables, focaccia baking"},
        {"substitute": "Refined Coconut Oil (solid at room temp)", "ratio": "1:1 substitute", "flavor_impact": "Neutral scent if refined, firm flaky crumb", "best_used_for": "Pie crusts, vegan pastry dough, cookies"}
    ],
    "parmesan": [
        {"substitute": "Nutritional Yeast + toasted blitzed cashews", "ratio": "1:1 sprinkle", "flavor_impact": "Cheesy, savory umami with B-vitamins", "best_used_for": "Pasta topping, roasted veggies, risotto finishing"},
        {"substitute": "Pecorino Romano", "ratio": "1:1 (use slightly less salt)", "flavor_impact": "Sharper, saltier sheep milk punch", "best_used_for": "Cacio e Pepe, Caesar dressing, carbonara"}
    ]
}

FEATURED_RECIPES = [
    {
        "id": "recipe_tuscan_skillet",
        "title": "Creamy Tuscan Sun-Dried Tomato Salmon Skillet",
        "description": "Crisp-skinned salmon fillets simmered in a velvety garlic, spinach, sun-dried tomato and basil cream sauce.",
        "cuisine": "Italian / Mediterranean",
        "prep_time": "10 mins",
        "cook_time": "18 mins",
        "servings": 2,
        "calories_per_serving": 490,
        "difficulty": "Intermediate",
        "dietary_tags": ["High-Protein", "Keto-Friendly", "Gluten-Free"],
        "ingredients": [
            "2 skin-on salmon fillets (6 oz / 170g each)",
            "1 tbsp extra-virgin olive oil",
            "1 tbsp unsalted butter",
            "4 cloves fresh garlic, finely minced",
            "1/3 cup oil-packed sun-dried tomatoes, drained & julienned",
            "2.5 cups fresh baby spinach leaves",
            "3/4 cup light cream or canned full-fat coconut milk",
            "1/3 cup freshly grated Parmesan cheese",
            "1 tbsp freshly chopped Italian basil",
            "Sea salt and freshly cracked black pepper to taste"
        ],
        "equipment_needed": ["Cast iron or heavy non-stick skillet", "Fish spatula", "Chef's knife", "Microplane"],
        "steps": [
            {
                "step_number": 1,
                "instruction": "Pat salmon fillets thoroughly dry with paper towels. Season both sides generously with sea salt and cracked black pepper.",
                "timer_seconds": 120,
                "pro_tip": "Removing surface moisture is the #1 secret to getting restaurant-quality crackling crispy salmon skin."
            },
            {
                "step_number": 2,
                "instruction": "Heat olive oil in a skillet over medium-high heat until shimmering. Place salmon skin-side down and press gently with spatula for 15 seconds. Sear undisturbed for 4-5 minutes until skin is golden crisp.",
                "timer_seconds": 270,
                "pro_tip": "Do not rush or nudge the fish; it naturally releases from the pan when the Maillard sear forms."
            },
            {
                "step_number": 3,
                "instruction": "Flip fillets carefully and cook the top side for another 2-3 minutes until internal temperature hits 125-130°F. Transfer salmon to a warm plate.",
                "timer_seconds": 150,
                "pro_tip": "Slightly undercooking salmon before saucing keeps it moist and buttery."
            },
            {
                "step_number": 4,
                "instruction": "Reduce heat to medium. Melt butter in the residual pan juices, add minced garlic and sun-dried tomatoes; sauté for 60 seconds until fragrant.",
                "timer_seconds": 60,
                "pro_tip": "Keep garlic moving so it does not burn or turn bitter."
            },
            {
                "step_number": 5,
                "instruction": "Pour in cream and bring to a gentle simmer. Stir in grated Parmesan until smooth. Add baby spinach and stir for 90 seconds until wilted.",
                "timer_seconds": 90,
                "pro_tip": "Whisk Parmesan briskly into simmering cream to achieve a velvety emulsified sauce."
            },
            {
                "step_number": 6,
                "instruction": "Nestle the salmon back into the skillet sauce skin-side up. Spoon warm sauce around fillets, garnish with fresh basil, and serve immediately.",
                "timer_seconds": 60,
                "pro_tip": "Pour sauce around the fillets rather than over the skin to preserve maximum crunch."
            }
        ],
        "chef_notes": [
            "Pairs wonderfully with roasted cauliflower mash, crusty sourdough, or wild rice.",
            "Leftovers store well in an airtight glass container for up to 2 days."
        ]
    },
    {
        "id": "recipe_mediterranean_bowl",
        "title": "Crispy Spiced Chickpea & Green Goddess Grain Bowl",
        "description": "Warm za'atar roasted chickpeas over fluffy farro, quick-pickled red onions, crunchy cucumbers, kalamata olives, and herb-packed avocado goddess dressing.",
        "cuisine": "Modern Mediterranean",
        "prep_time": "15 mins",
        "cook_time": "20 mins",
        "servings": 2,
        "calories_per_serving": 440,
        "difficulty": "Easy",
        "dietary_tags": ["Vegan", "High-Fiber", "Dairy-Free"],
        "ingredients": [
            "1 can (15 oz / 425g) chickpeas, rinsed and dried",
            "1 tbsp olive oil + 1 tsp za'atar seasoning + 1/2 tsp cumin",
            "1.5 cups cooked farro or quinoa",
            "1 cup Persian cucumber, half-moons",
            "1 cup cherry tomatoes, halved",
            "1/4 cup kalamata olives, pitted",
            "Green Goddess Dressing: 1/2 avocado, 1/2 cup fresh cilantro/parsley, 1 lemon juiced, 1 garlic clove, 2 tbsp water, salt"
        ],
        "equipment_needed": ["Sheet pan", "High-speed blender", "Mixing bowls"],
        "steps": [
            {
                "step_number": 1,
                "instruction": "Preheat oven to 400°F (205°C). Toss dried chickpeas with olive oil, za'atar, cumin, and sea salt on baking sheet.",
                "timer_seconds": 180,
                "pro_tip": "Ensure chickpeas are bone dry with a clean kitchen towel so they roast crisp rather than steam."
            },
            {
                "step_number": 2,
                "instruction": "Roast chickpeas for 20 minutes, shaking pan halfway, until golden and crackly.",
                "timer_seconds": 1200,
                "pro_tip": "Let roasted chickpeas cool 5 minutes on the sheet pan to crisp up even further."
            },
            {
                "step_number": 3,
                "instruction": "Blend avocado, herbs, lemon juice, garlic, water, and salt until ultra silky and vibrant green.",
                "timer_seconds": 90,
                "pro_tip": "Add an ice cube to the blender to keep the green herbs from oxidizing and keep the color neon green."
            },
            {
                "step_number": 4,
                "instruction": "Divide warm farro between bowls. Top with roasted chickpeas, cucumbers, cherry tomatoes, and olives. Drizzle generously with Green Goddess dressing.",
                "timer_seconds": 120,
                "pro_tip": "Assemble in distinct sections for a stunning Instagram-ready presentation."
            }
        ],
        "chef_notes": [
            "Great for weekday meal-prep: pack dressing separately and assemble in under 2 minutes."
        ]
    }
]

class CookingService:
    async def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        recipe_context: Optional[str] = None,
        skill_level: str = "Intermediate",
        user_id: Optional[str] = "guest_user"
    ) -> Dict[str, Any]:
        """Interactive culinary chat with smart recipe & substitution recommendations."""
        msg_lower = message.lower()
        is_demo = True
        reply = ""
        suggested_recipe = None
        suggested_substitutions = None
        quick_suggestions = [
            "Show me a healthy 20-minute dinner recipe",
            "What can I substitute for buttermilk in pancakes?",
            "How do I cook salmon with crispy skin?",
            "What flavors pair best with roasted eggplant?"
        ]

        # Check for substitution queries
        for key in COMMON_SUBSTITUTIONS.keys():
            if f"substitute for {key}" in msg_lower or f"replace {key}" in msg_lower or f"sub {key}" in msg_lower or f"instead of {key}" in msg_lower:
                subs = COMMON_SUBSTITUTIONS[key]
                reply = (
                    f"Here are the premier culinary substitutes for **{key.title()}** based on kitchen science:\n\n"
                )
                for opt in subs:
                    reply += f"• **{opt['substitute']}** ({opt['ratio']}): {opt['flavor_impact']} — *Best for {opt['best_used_for']}*.\n"
                reply += "\nWhich dish are you preparing? I can tailor the exact ratio to your specific recipe!"
                return {
                    "reply": reply,
                    "suggested_recipe": None,
                    "suggested_substitutions": subs,
                    "quick_suggestions": [
                        "Tell me the best bake time",
                        "Show me full recipe instructions",
                        "How do I store leftovers?"
                    ],
                    "is_demo_mode": True
                }

        # Try Live Gemini if configured
        if gemini_service.is_live_ai_available:
            system_prompt = f"""
            You are 'Chef Auguste', the master culinary assistant inside FoodVerse AI.
            The user's culinary skill level is {skill_level}.
            Always provide enthusiastic, scientifically grounded cooking advice, specific temperature measurements,
            safety cues (internal temps for meat/poultry), and pro-chef seasoning tips.
            If the user asks for a recipe, give a comprehensive response.
            """
            live_reply = await gemini_service.generate_text_chat(
                prompt=message,
                system_instruction=system_prompt,
                history=history
            )
            if live_reply:
                # If asking for salmon or grain bowl, attach structured recipe card
                if "salmon" in msg_lower or "fish" in msg_lower:
                    suggested_recipe = FEATURED_RECIPES[0]
                elif "chickpea" in msg_lower or "grain" in msg_lower or "bowl" in msg_lower or "vegan" in msg_lower:
                    suggested_recipe = FEATURED_RECIPES[1]
                    
                return {
                    "reply": live_reply,
                    "suggested_recipe": suggested_recipe,
                    "suggested_substitutions": None,
                    "quick_suggestions": [
                        "Can I make this dairy-free?",
                        "What wine or beverage pairs with this?",
                        "How to scale this for 6 people?"
                    ],
                    "is_demo_mode": False
                }

        # Smart Fallback Culinary Assistant Engine
        if "salmon" in msg_lower or "fish" in msg_lower or "dinner" in msg_lower:
            suggested_recipe = FEATURED_RECIPES[0]
            reply = (
                "Here is one of our most popular chef-curated dishes: **Creamy Tuscan Sun-Dried Tomato Salmon Skillet**!\n\n"
                "**Why this works:** Searing salmon skin-down at high heat locks in natural omega-3 fats, while garlic and sun-dried tomatoes "
                "release sweet, savory glutamates into the cream sauce. You can also view the interactive step-by-step card below with built-in timers!"
            )
        elif "vegan" in msg_lower or "grain" in msg_lower or "chickpea" in msg_lower or "salad" in msg_lower:
            suggested_recipe = FEATURED_RECIPES[1]
            reply = (
                "I recommend our **Crispy Spiced Chickpea & Green Goddess Grain Bowl**!\n\n"
                "Packed with plant-based protein, crunchy roasted chickpeas, and a vibrant antioxidant-rich avocado herb dressing. "
                "Full preparation steps and cooking timers are attached below."
            )
        elif "egg" in msg_lower or "substitute" in msg_lower or "flax" in msg_lower:
            subs = COMMON_SUBSTITUTIONS["egg"]
            reply = (
                "For egg substitutions, ground flaxseed mixed with water (1 tbsp flax + 3 tbsp water) forms a mucilage that binds baked goods wonderfully. "
                "For lighter cakes or meringues, whipped aquafaba (chickpea brine) is unmatched!"
            )
            suggested_substitutions = subs
        else:
            reply = (
                f"Hello! I am your **FoodVerse AI Smart Cooking Assistant**. I can help you with:\n\n"
                "1. **Recipe Creation:** Tell me ingredients in your pantry, and I'll build a tailored gourmet recipe.\n"
                "2. **Ingredient Swaps:** Ask 'What can I replace buttermilk/eggs/cream with?' for culinary-tested alternatives.\n"
                "3. **Technique Coaching:** Inquire about searing temperatures, emulsifying sauces, knife skills, or food safety temps.\n"
                "4. **Step-by-Step Cooking:** Follow structured cooking cards with interactive countdown timers!"
            )

        # Log conversation in database
        chat_col = get_collection("chat_history")
        await chat_col.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "message": message,
            "reply": reply,
            "created_at": datetime.datetime.utcnow().isoformat()
        })

        return {
            "reply": reply,
            "suggested_recipe": suggested_recipe,
            "suggested_substitutions": suggested_substitutions,
            "quick_suggestions": quick_suggestions,
            "is_demo_mode": is_demo
        }

    def get_substitutions_for(self, ingredient: str) -> Dict[str, Any]:
        key = ingredient.strip().lower()
        for k, v in COMMON_SUBSTITUTIONS.items():
            if k in key or key in k:
                return {
                    "original_ingredient": ingredient,
                    "options": v,
                    "cooking_tips": [
                        f"When substituting for {ingredient}, test a small batch first to confirm moisture balance.",
                        "Liquid substitutions may require slight reductions in other recipe fluids."
                    ],
                    "is_demo_mode": True
                }

        # Generic default substitution
        return {
            "original_ingredient": ingredient,
            "options": [
                {
                    "substitute": f"Culinary alternative for {ingredient}",
                    "ratio": "1:1 equivalent",
                    "flavor_impact": "Neutral profile",
                    "best_used_for": "General cooking & baking"
                }
            ],
            "cooking_tips": [
                "Adjust seasoning gradually when introducing an alternative ingredient."
            ],
            "is_demo_mode": True
        }

    async def save_recipe(self, recipe: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        col = get_collection("saved_recipes")
        recipe_to_save = dict(recipe)
        recipe_to_save["user_id"] = user_id
        recipe_to_save["saved_at"] = datetime.datetime.utcnow().isoformat()
        if "_id" not in recipe_to_save:
            recipe_to_save["_id"] = str(uuid.uuid4())
        await col.insert_one(recipe_to_save)
        return recipe_to_save

    async def get_saved_recipes(self, user_id: str) -> List[Dict[str, Any]]:
        col = get_collection("saved_recipes")
        cursor = col.find({"user_id": user_id})
        items = await cursor.to_list(length=50)
        return items

cooking_service = CookingService()
