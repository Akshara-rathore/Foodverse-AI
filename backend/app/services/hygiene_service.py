import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.database import get_collection

SAMPLE_HYGIENE_PRESETS = [
    {
        "id": "preset_commercial_cookline",
        "facility_area": "Main Cook Line & Griddle Station",
        "hygiene_score": 91,
        "grade": "Grade A (Compliant - Minor Preventive Actions)",
        "summary": "High standard of commercial kitchen sanitation. Stainless steel work surfaces show active degreasing, grease trap filters are clear, and personal protective equipment is visibly worn.",
        "checklist": [
            {
                "category": "Surface Sanitation",
                "status": "Compliant",
                "observation": "Stainless prep counters wiped down; sanitizing solution bucket visibly maintained with test strips nearby.",
                "risk_level": "None"
            },
            {
                "category": "Cross-Contamination Prevention",
                "status": "Compliant",
                "observation": "Color-coded cutting boards (red for raw meat, green for produce) stored upright on drying rack with proper airflow.",
                "risk_level": "None"
            },
            {
                "category": "Personal Hygiene & Attire",
                "status": "Compliant",
                "observation": "Line cooks wearing clean aprons, hair restraints/beard nets, and single-use nitrile gloves.",
                "risk_level": "None"
            },
            {
                "category": "Equipment Cleanliness",
                "status": "Observation",
                "observation": "Minor carbon buildup along edge of grill splash guard; not in direct contact with food contact zone.",
                "risk_level": "Low"
            }
        ],
        "corrective_actions": [
            {
                "priority": "Routine",
                "action": "Schedule end-of-shift deep scrubbing of grill splash guards and side ventilation baffles.",
                "target_area": "Flattop Griddle Perimeter",
                "responsible_role": "Closing Line Cook / Shift Supervisor"
            },
            {
                "priority": "Routine",
                "action": "Verify quat sanitizer PPM concentration using chemical test strips every 2 hours.",
                "target_area": "Line Sanitizer Station",
                "responsible_role": "Kitchen Lead"
            }
        ],
        "cross_contamination_risk": "Low",
        "sanitization_compliance": "Good"
    },
    {
        "id": "preset_prep_table_risk",
        "facility_area": "Salad & Cold Prep Station",
        "hygiene_score": 72,
        "grade": "Grade B (Conditional Pass - Corrective Actions Required)",
        "summary": "Operational kitchen prep station exhibiting moderate sanitation issues: wiping cloth left on cutting board, overflowing organic waste bin, and temperature display needs verification.",
        "checklist": [
            {
                "category": "Surface Sanitation",
                "status": "Observation",
                "observation": "Damp soiled towel resting directly on polyurethane cutting surface instead of submerged in sanitizer bucket.",
                "risk_level": "Medium"
            },
            {
                "category": "Cross-Contamination Prevention",
                "status": "Compliant",
                "observation": "Prepped leafy greens and diced vegetables covered with foodservice film and labeled with prep dates.",
                "risk_level": "Low"
            },
            {
                "category": "Storage & Waste Management",
                "status": "Critical Risk",
                "observation": "Under-counter trash bin is overfilled with organic vegetable trimmings, touching counter support rail.",
                "risk_level": "High"
            },
            {
                "category": "Equipment Cleanliness",
                "status": "Observation",
                "observation": "Food residue accumulation along silicone gasket of undercounter reach-in refrigerator door.",
                "risk_level": "Medium"
            }
        ],
        "corrective_actions": [
            {
                "priority": "Immediate",
                "action": "Empty and sanitize undercounter compost/waste bin immediately; ensure lid stays closed.",
                "target_area": "Prep Station Waste Receptacle",
                "responsible_role": "Prep Cook"
            },
            {
                "priority": "Immediate",
                "action": "Discard soiled towel, re-sanitize the white cutting board with approved food-contact sanitizer (200 PPM quat).",
                "target_area": "Main Cold Prep Board",
                "responsible_role": "Prep Cook"
            },
            {
                "priority": "Short-term",
                "action": "Deep-clean reach-in door gaskets with antimicrobial solution to prevent mold spore harborage.",
                "target_area": "Reach-in Cooler Gaskets",
                "responsible_role": "Kitchen Porter"
            }
        ],
        "cross_contamination_risk": "Moderate",
        "sanitization_compliance": "Satisfactory"
    },
    {
        "id": "preset_dishwashing_hygiene",
        "facility_area": "Dishwashing & Warewashing Station",
        "hygiene_score": 86,
        "grade": "Grade A- (Standard Compliance)",
        "summary": "Commercial 3-compartment sink and conveyor dish machine showing good temperature logs and chemical sanitization, with minor floor pooling needing squeegee maintenance.",
        "checklist": [
            {
                "category": "Equipment Cleanliness",
                "status": "Compliant",
                "observation": "Commercial dishwasher final rinse temperature digital gauge reads 182°F (compliant with 180°F NSF heat sanitizing spec).",
                "risk_level": "None"
            },
            {
                "category": "Storage & Organization",
                "status": "Compliant",
                "observation": "Clean saute pans and hotel pans inverted on wire shelving at least 6 inches above floor level.",
                "risk_level": "None"
            },
            {
                "category": "Surface Sanitation",
                "status": "Observation",
                "observation": "Excess standing water pool near floor drain under the pre-rinse sink basin.",
                "risk_level": "Low"
            }
        ],
        "corrective_actions": [
            {
                "priority": "Short-term",
                "action": "Squeegee water into trench drain and verify floor drain trap is free of food debris to prevent slip hazards and pest attraction.",
                "target_area": "Warewashing Floor Area",
                "responsible_role": "Dishwasher / Steward"
            }
        ],
        "cross_contamination_risk": "Low",
        "sanitization_compliance": "Good"
    }
]

class HygieneService:
    async def analyze_hygiene(
        self,
        image_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        mime_type: Optional[str] = "image/jpeg",
        user_id: Optional[str] = "guest_user",
        preset_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze restaurant kitchen or food prep area for hygiene compliance and risks."""
        # Preset selection
        if preset_id:
            for p in SAMPLE_HYGIENE_PRESETS:
                if p["id"] == preset_id:
                    result_data = dict(p)
                    result_data["id"] = str(uuid.uuid4())
                    result_data["is_demo_mode"] = True
                    result_data["created_at"] = datetime.datetime.utcnow().isoformat()
                    result_data["user_id"] = user_id
                    result_data["disclaimer"] = (
                        "Visual audit report only. Visual assessment is supplementary and does not replace "
                        "official local municipal health department inspections, ATP swab testing, or microbiological testing."
                    )
                    history_col = get_collection("hygiene_history")
                    await history_col.insert_one(result_data)
                    return result_data

        # Custom uploaded image
        if image_bytes:
            if not gemini_service.is_live_ai_available:
                return {
                    "status": "api_key_required",
                    "error_type": "api_key_required",
                    "title": "Google Gemini API Key Required",
                    "message": "Live multimodal AI kitchen hygiene auditing requires a Google Gemini API key. Please configure GEMINI_API_KEY in backend/.env or click 'Smart Demo Mode' in the topbar to enter your key. Alternatively, explore the instant sample kitchen audits above.",
                    "requires_api_key": True,
                    "is_demo_mode": True
                }

            prompt = """
            You are a certified professional food safety auditor and HACCP inspection specialist.
            Analyze this commercial kitchen / food-preparation photograph for visible cleanliness issues,
            sanitation practices, potential cross-contamination risks, personal hygiene compliance,
            equipment maintenance, and pest/waste control.
            Return ONLY a valid JSON object matching this schema:
            {
              "facility_area": "Prep Station / Cook Line / Dishwashing / Walk-in Cooler",
              "hygiene_score": 88,
              "grade": "Grade A (Excellent) / Grade B (Standard) / Grade C (Needs Remediation)",
              "summary": "Executive inspection overview",
              "checklist": [
                {
                  "category": "Surface Sanitation / Cross-Contamination Prevention / Personal Hygiene / Equipment Cleanliness",
                  "status": "Compliant / Observation / Critical Risk",
                  "observation": "Detailed factual observation",
                  "risk_level": "None / Low / Medium / High"
                }
              ],
              "corrective_actions": [
                {
                  "priority": "Immediate / Short-term / Routine",
                  "action": "Concrete remediation task",
                  "target_area": "Specific piece of equipment or zone",
                  "responsible_role": "Line Cook / Shift Manager / Steward"
                }
              ],
              "cross_contamination_risk": "Low / Moderate / Elevated",
              "sanitization_compliance": "Good / Satisfactory / Deficient"
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
                    "Visual audit report only. Visual assessment is supplementary and does not replace "
                    "official local municipal health department inspections, ATP swab testing, or microbiological testing."
                )
                history_col = get_collection("hygiene_history")
                await history_col.insert_one(result_data)
                return result_data

            return {
                "status": "ai_error",
                "error_type": "ai_error",
                "title": "Hygiene Audit Error",
                "message": f"Gemini vision AI was unable to inspect this kitchen image ({err or 'unparseable format'}). Please try another photo.",
                "requires_api_key": False,
                "is_demo_mode": False
            }

        return {
            "status": "error",
            "message": "Please upload a kitchen station photo or select a sample inspection.",
            "error_type": "missing_input"
        }

    async def get_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        history_col = get_collection("hygiene_history")
        cursor = history_col.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        items = await cursor.to_list(length=limit)
        return items

    def get_presets(self) -> List[Dict[str, Any]]:
        return SAMPLE_HYGIENE_PRESETS

hygiene_service = HygieneService()
