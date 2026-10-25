import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.database import get_collection

SAMPLE_FRESHNESS_PRESETS = [
    {
        "id": "preset_apple_crisp",
        "item_name": "Honeycrisp Apple (Organic)",
        "category": "Fruits",
        "freshness_score": 92,
        "status_label": "Optimal Freshness (Peak Quality)",
        "estimated_shelf_life": "7-10 days refrigerated (4°C / 40°F)",
        "anomalies": [
            {
                "defect_type": "Minor Surface Abrasion",
                "severity": "Low",
                "location": "Upper right skin quadrant",
                "description": "Faint epidermal scuff caused during harvesting transit; cuticle layer remains sealed with no fungal penetration."
            }
        ],
        "observations": [
            "Turgid cellular structure with high skin tautness and natural waxy bloom intact.",
            "Stem is green-brown and securely attached, indicating recent harvest.",
            "No visible water-soaking, wrinkling, or deep soft spots detected."
        ],
        "storage_recommendations": [
            "Store in the crisper drawer of your refrigerator at 32-38°F (0-3°C) with 90% relative humidity.",
            "Keep isolated from ethylene-sensitive leafy greens, as apples naturally emit ethylene gas."
        ],
        "culinary_recommendations": [
            "Ideal for raw snacking, crisp autumn salads, or cheese pairing.",
            "Can be dehydrated into healthy baked apple crisps."
        ]
    },
    {
        "id": "preset_banana_bruised",
        "item_name": "Cavendish Banana (Overripe Stage)",
        "category": "Fruits",
        "freshness_score": 68,
        "status_label": "Acceptable / Consume or Freeze Soon",
        "estimated_shelf_life": "1-2 days at room temperature; 1 month frozen",
        "anomalies": [
            {
                "defect_type": "Enzymatic Browning & Sugar Spotting",
                "severity": "Moderate",
                "location": "Distributed across peel surface",
                "description": "Extensive brown senescence spots indicative of chlorophyll degradation and starch conversion into simple fructose/glucose."
            },
            {
                "defect_type": "Softening Stem Neck",
                "severity": "Moderate",
                "location": "Crown detachment zone",
                "description": "Micro-creasing around the pedicel suggesting pulp loss of turgor pressure."
            }
        ],
        "observations": [
            "Starch-to-sugar conversion is near completion (~80% simple sugars).",
            "Pulp is soft but peel barrier remains unbroken; no superficial mold mycelia observed.",
            "High fragrance of aromatic isoamyl acetate compounds."
        ],
        "storage_recommendations": [
            "Do not refrigerate in peel (will cause chilling injury and blacken skin).",
            "Peel immediately, slice into coins, and store in an airtight freezer container for smoothies."
        ],
        "culinary_recommendations": [
            "Prime candidate for banana bread, protein pancakes, or dairy-free 'nice cream'.",
            "High sweetness eliminates the need for added cane sugar in baking recipes."
        ]
    },
    {
        "id": "preset_spinach_wilting",
        "item_name": "Baby Spinach Leaves",
        "category": "Vegetables",
        "freshness_score": 58,
        "status_label": "Noticeable Degradation / Cook Immediately",
        "estimated_shelf_life": "24 hours maximum (refrigerated)",
        "anomalies": [
            {
                "defect_type": "Cellular Wilting & Moisture Loss",
                "severity": "Moderate",
                "location": "Leaf margins and lower stem petiole",
                "description": "Flaccid leaf lamina due to transpirational water loss and cell wall relaxation."
            },
            {
                "defect_type": "Early Chlorosis (Discoloration)",
                "severity": "Low",
                "location": "Outer leaf tips",
                "description": "Subtle yellowish tint caused by senescence-induced chlorophyll breakdown."
            }
        ],
        "observations": [
            "Leaves have lost crispness; no slimy anaerobic bacterial rot observed on surfaces.",
            "Total nutritional value (Vitamin C and Folate) is decreasing with storage duration.",
            "Safe to consume only if cooked thoroughly."
        ],
        "storage_recommendations": [
            "Wrap loosely in a dry paper towel inside a breathable container to absorb condensation.",
            "Maintain refrigerator temperature strictly below 40°F (4°C)."
        ],
        "culinary_recommendations": [
            "Sauté immediately with garlic and olive oil, fold into an omelette, or blend into vegetable soup.",
            "Do not serve raw in salads due to compromised texture."
        ]
    },
    {
        "id": "preset_strawberries_mold_risk",
        "item_name": "Field Strawberries (Risk Detected)",
        "category": "Berries",
        "freshness_score": 38,
        "status_label": "Potential Spoilage Risk / Discard Contaminated",
        "estimated_shelf_life": "Discard affected berries; remaining consume within 12 hours",
        "anomalies": [
            {
                "defect_type": "Fungal Mycelium (Mold-like pattern)",
                "severity": "High",
                "location": "Calyx base and adjacent fruit shoulder",
                "description": "Visual white/grey fibrous filamentous growth consistent with Botrytis cinerea (grey mold)."
            },
            {
                "defect_type": "Soft Rot & Tissue Liquefaction",
                "severity": "High",
                "location": "Lower berry tip",
                "description": "Dark bruised water-soaked depression prone to rapid spore dispersal."
            }
        ],
        "observations": [
            "High risk of airborne fungal spores contaminating adjacent berries in the punnet.",
            "Soft fruit matrix allows microscopic fungal hyphae to penetrate deeper than visible surface growth.",
            "Unfit for consumption where mold is present."
        ],
        "storage_recommendations": [
            "Immediately discard all berries showing mold fibers or soft water spots.",
            "Inspect neighboring berries, wash in a 3:1 water-vinegar solution, pat completely dry, and eat today."
        ],
        "culinary_recommendations": [
            "DO NOT consume or trim moldy berries (spores and mycotoxins penetrate porous soft fruits).",
            "Sanitize the container and refrigerator shelf to avoid cross-spoilage."
        ]
    }
]

class FreshnessService:
    async def analyze_freshness(
        self,
        image_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        mime_type: Optional[str] = "image/jpeg",
        user_id: Optional[str] = "guest_user",
        preset_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze food freshness for visual signs of bruising, discoloration, mold, wilting."""
        # Preset selection
        if preset_id:
            for p in SAMPLE_FRESHNESS_PRESETS:
                if p["id"] == preset_id:
                    result_data = dict(p)
                    result_data["id"] = str(uuid.uuid4())
                    result_data["is_demo_mode"] = True
                    result_data["created_at"] = datetime.datetime.utcnow().isoformat()
                    result_data["user_id"] = user_id
                    result_data["disclaimer"] = (
                        "CAUTION: Visual analysis cannot detect unseen microbial pathogens, bacterial contamination, "
                        "or internal toxins. Never consume food that smells off, has mold, or appears unsafe, "
                        "regardless of visual score."
                    )
                    history_col = get_collection("freshness_history")
                    await history_col.insert_one(result_data)
                    return result_data

        # Custom uploaded image
        if image_bytes:
            if not gemini_service.is_live_ai_available:
                return {
                    "status": "api_key_required",
                    "error_type": "api_key_required",
                    "title": "Google Gemini API Key Required",
                    "message": "Live multimodal AI fresh produce inspection requires a Google Gemini API key. Please configure GEMINI_API_KEY in backend/.env or click 'Smart Demo Mode' in the topbar to enter your key. Alternatively, explore the instant sample produce items above.",
                    "requires_api_key": True,
                    "is_demo_mode": True
                }

            prompt = """
            You are a food safety scientist and agricultural post-harvest inspector.
            Analyze this food image strictly for visual freshness indicators, bruising, discoloration,
            mold-like patterns, wilting, and textural degradation.
            Return ONLY a valid JSON object matching this schema:
            {
              "item_name": "Name of produce/food",
              "category": "Fruits / Vegetables / Dairy / Meat / Bakery / Prepared",
              "freshness_score": 85,
              "status_label": "Optimal Freshness / Acceptable / Noticeable Degradation / Potential Spoilage Risk",
              "estimated_shelf_life": "e.g. 3-4 days refrigerated",
              "anomalies": [
                {
                  "defect_type": "Bruising / Discoloration / Mold-like pattern / Wilting / Texture degradation",
                  "severity": "Low / Moderate / High",
                  "location": "Precise visual region",
                  "description": "Scientific morphological explanation"
                }
              ],
              "observations": [
                "Key observation 1",
                "Key observation 2"
              ],
              "storage_recommendations": [
                "Storage temperature and humidity guideline",
                "Shelf life preservation tip"
              ],
              "culinary_recommendations": [
                "Culinary usage recommendation",
                "Pre-consumption safety step"
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
                    "CAUTION: Visual analysis cannot detect unseen microbial pathogens, bacterial contamination, "
                    "or internal toxins. Never consume food that smells off, has mold, or appears unsafe, "
                    "regardless of visual score."
                )
                history_col = get_collection("freshness_history")
                await history_col.insert_one(result_data)
                return result_data

            return {
                "status": "ai_error",
                "error_type": "ai_error",
                "title": "Freshness Analysis Error",
                "message": f"Gemini vision AI was unable to inspect this image ({err or 'unparseable format'}). Please try another photo.",
                "requires_api_key": False,
                "is_demo_mode": False
            }

        return {
            "status": "error",
            "message": "Please upload a produce photo or select a sample scan.",
            "error_type": "missing_input"
        }

    async def get_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        history_col = get_collection("freshness_history")
        cursor = history_col.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        items = await cursor.to_list(length=limit)
        return items

    def get_presets(self) -> List[Dict[str, Any]]:
        return SAMPLE_FRESHNESS_PRESETS

freshness_service = FreshnessService()
