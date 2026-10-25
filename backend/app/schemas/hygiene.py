from pydantic import BaseModel, Field
from typing import List, Optional

class HygieneCheckItem(BaseModel):
    category: str # "Surface Sanitation", "Cross-Contamination Prevention", "Personal Hygiene/Attire", "Storage & Organization", "Equipment Cleanliness"
    status: str # "Compliant", "Observation", "Critical Risk"
    observation: str
    risk_level: str # "None", "Low", "Medium", "High"

class CorrectiveAction(BaseModel):
    priority: str # "Immediate", "Short-term", "Routine"
    action: str
    target_area: str
    responsible_role: str

class HygieneAuditResponse(BaseModel):
    id: Optional[str] = None
    facility_area: str # "Prep Station", "Cook Line", "Dishwashing Station", "Cold Storage", "Baking Area"
    hygiene_score: int = Field(default=85, ge=0, le=100)
    grade: str # "Grade A (Excellent)", "Grade B (Standard)", "Grade C (Needs Immediate Remediation)"
    summary: str
    checklist: List[HygieneCheckItem]
    corrective_actions: List[CorrectiveAction]
    cross_contamination_risk: str # "Low", "Moderate", "Elevated"
    sanitization_compliance: str # "Good", "Satisfactory", "Deficient"
    is_demo_mode: bool = False
    disclaimer: str = (
        "Visual audit report only. Visual assessment is supplementary and does not replace official local municipal health department inspections, ATP swab testing, or microbiological testing."
    )
    created_at: Optional[str] = None
    image_url: Optional[str] = None
