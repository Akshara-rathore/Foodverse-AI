from pydantic import BaseModel, Field
from typing import List, Optional

class VisualAnomaly(BaseModel):
    defect_type: str # Bruising, Discoloration, Mold-like pattern, Wilting, Texture degradation, etc.
    severity: str # Low, Moderate, High
    location: str
    description: str

class FreshnessAnalysisResponse(BaseModel):
    id: Optional[str] = None
    item_name: str
    category: str # Fruits, Vegetables, Dairy, Bakery, Meat/Poultry, etc.
    freshness_score: int = Field(default=80, ge=0, le=100)
    status_label: str # "Optimal Freshness", "Acceptable / Consumable Soon", "Noticeable Degradation", "Potential Spoilage Risk"
    estimated_shelf_life: str # e.g. "2-3 days refrigerated"
    anomalies: List[VisualAnomaly] = []
    observations: List[str]
    storage_recommendations: List[str]
    culinary_recommendations: List[str]
    is_demo_mode: bool = False
    disclaimer: str = (
        "CAUTION: Visual analysis cannot detect unseen microbial pathogens, bacterial contamination, or internal toxins. Never consume food that smells off, has mold, or appears unsafe, regardless of visual score."
    )
    created_at: Optional[str] = None
    image_url: Optional[str] = None
