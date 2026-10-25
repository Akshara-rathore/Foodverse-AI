import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import db_instance, get_collection
from app.routers import (
    auth,
    nutrition,
    freshness,
    hygiene,
    cooking,
    meal_planner,
    dashboard
)
from app.services.nutrition_service import SAMPLE_NUTRITION_PRESETS
from app.services.freshness_service import SAMPLE_FRESHNESS_PRESETS
from app.services.hygiene_service import SAMPLE_HYGIENE_PRESETS
from app.services.cooking_service import FEATURED_RECIPES

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("foodverse")

async def seed_initial_demo_data():
    """Populate initial history so dashboard and history screens look vibrant immediately."""
    try:
        nutri_col = get_collection("nutrition_history")
        count = await nutri_col.count_documents({})
        if count == 0:
            for item in SAMPLE_NUTRITION_PRESETS:
                doc = dict(item)
                doc["user_id"] = "guest_user"
                doc["is_demo_mode"] = True
                await nutri_col.insert_one(doc)

        fresh_col = get_collection("freshness_history")
        f_count = await fresh_col.count_documents({})
        if f_count == 0:
            for item in SAMPLE_FRESHNESS_PRESETS:
                doc = dict(item)
                doc["user_id"] = "guest_user"
                doc["is_demo_mode"] = True
                await fresh_col.insert_one(doc)

        hygiene_col = get_collection("hygiene_history")
        h_count = await hygiene_col.count_documents({})
        if h_count == 0:
            for item in SAMPLE_HYGIENE_PRESETS:
                doc = dict(item)
                doc["user_id"] = "guest_user"
                doc["is_demo_mode"] = True
                await hygiene_col.insert_one(doc)

        recipe_col = get_collection("saved_recipes")
        r_count = await recipe_col.count_documents({})
        if r_count == 0:
            for item in FEATURED_RECIPES:
                doc = dict(item)
                doc["user_id"] = "guest_user"
                await recipe_col.insert_one(doc)
    except Exception as e:
        logger.warning(f"Demo data seeding notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FoodVerse AI backend engine...")
    await db_instance.connect()
    await seed_initial_demo_data()
    yield
    # Shutdown
    await db_instance.close()
    logger.info("FoodVerse AI backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Food Intelligence Agent API powered by FastAPI, MongoDB, and Google Gemini AI.",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(nutrition.router, prefix=api_prefix)
app.include_router(freshness.router, prefix=api_prefix)
app.include_router(hygiene.router, prefix=api_prefix)
app.include_router(cooking.router, prefix=api_prefix)
app.include_router(meal_planner.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "api_docs": "/docs",
        "features": [
            "Food Recognition & Nutrition Analysis",
            "Food Freshness Detection",
            "Restaurant Hygiene Monitoring",
            "Smart Cooking Assistant",
            "Personalized Meal Planner"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db_instance.is_connected_to_mongo else "local_resilient_store",
        "gemini_live_ai": settings.has_gemini_key
    }
