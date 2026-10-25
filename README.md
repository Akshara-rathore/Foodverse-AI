# FoodVerse AI – Multimodal Food Intelligence Agent 🥑🥦

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_Vision-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_%2B_Resilient_Store-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com)

**FoodVerse AI** is a multimodal food intelligence and kitchen companion web application. It brings together food image analysis, nutrition insights, freshness checks, restaurant hygiene support, cooking assistance, and meal planning in a responsive interface.

---

## 🌟 Core Features

### 1. 🥗 Food Recognition & Nutrition Analysis
- **Food image analysis:** Upload a meal photo or choose a sample preset.
- **Macronutrient breakdown:** Estimated calories, protein, carbohydrates, fats, and fiber.
- **Visual summaries:** Macro distribution, glycemic information where available, and health scores.
- **Nutrition guidance:** Actionable information based on the available analysis.
- **Medical disclaimer:** Results are estimates, not laboratory measurements or medical advice.

### 2. 🔍 Food Freshness & Defect Detection
- **Visual inspection:** Examine produce for visible bruising, wilting, discoloration, and mold-like patterns.
- **Freshness estimate:** Display an indicative freshness score and suggested storage or use timeline when supported.
- **Defect descriptions:** Identify visible defect types and severity where the model can do so.
- **Safety advisory:** Visual analysis cannot confirm internal bacterial contamination or toxins. Do not use it alone to decide whether food is safe to eat.

### 3. 🛡️ Restaurant Hygiene Monitoring
- **Visible sanitation review:** Analyze images of food-preparation and dishwashing areas.
- **Checklist findings:** Flag visible cleanliness concerns and possible food-safety checklist issues.
- **Corrective actions:** Organize suggested actions by priority.
- **Audit report:** Print or export a report if supported by the running application.

### 4. 👨‍🍳 Smart Cooking Assistant
- **Cooking chat:** Ask cooking questions through the app.
- **Step-by-step recipes:** Follow recipe instructions and any available cooking timers.
- **Ingredient substitutions:** Get suggested alternatives for common ingredients.
- **Personal cookbook:** Save favorite recipes if the feature is enabled in the current build.

### 5. 📅 Personalized Meal Planner & Grocery List
- **Meal schedules:** Generate meal ideas based on dietary preferences.
- **Calorie targets:** Configure daily calorie goals where supported.
- **Meal swaps:** Replace meals with alternatives when available.
- **Grocery checklist:** Organize ingredients into categories and track items.

---

## ⚡ Demo Mode and Persistence

The application may provide sample data for demonstrating features without a live AI request. Check the interface's labels to distinguish sample results from live analysis.

- **Demo samples:** Use available sample scans and recipes to explore the interface.
- **Live Gemini mode:** Requires a valid Gemini API key and compatible model configuration.
- **Local persistence:** The backend configuration determines whether data is stored in a local JSON file or MongoDB. Confirm the behavior in the current code and logs before relying on it.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, CSS, Axios (as used by the project) |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| AI | Google Gemini, if configured |
| Database | MongoDB and/or local JSON persistence, depending on backend configuration |
| Authentication | JWT and password hashing, if enabled in the current backend |
| Voice | Browser Web Speech API, if supported by the browser and app |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js and npm
- Python 3.10 or a version compatible with `backend/requirements.txt`
- Optional: MongoDB, if required by your configuration

### macOS / Linux

#### 1. Start the backend
Open Terminal in the project directory and run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create your backend `.env` file from the example if the project requires environment variables:

```bash
cp .env.example .env
```

Edit `backend/.env` and set the required values. Do not commit real API keys or secrets.

Start the backend:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start the frontend
Open a **second Terminal window** in the project directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal (commonly `http://localhost:5173`).

### Windows

#### 1. Backend (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (a second PowerShell window)
```powershell
cd frontend
npm install
npm run dev
```

---

## 🌐 Local Development URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` (confirm the URL printed by Vite) |
| Backend API | `http://127.0.0.1:8000` |
| Swagger API docs | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |

These backend documentation URLs work only if the FastAPI server is running and the corresponding routes are enabled. A `/health` endpoint is not listed here because its availability must be confirmed in the code.

---

## 🔑 Environment Variables

Use the variable names documented in `backend/.env.example` and `backend/app/config.py`. Example values may include:

```ini
PORT=8000
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=your_configured_model_name
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=foodverse_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

These are illustrative examples; only set variables the application actually reads. Replace placeholder secrets with secure values. Keep `.env` files out of Git and never publish API keys or JWT secrets.

---

## 🧪 Suggested Testing Workflows

1. **Nutrition analysis:** Open the nutrition page, try a sample if available, and then test image upload. Check that the UI clearly distinguishes demo output from live analysis.
2. **Freshness detection:** Try a sample produce image or upload an image. Treat the result as a visual estimate, not proof of food safety.
3. **Hygiene review:** Open the hygiene feature, inspect the findings, and test report printing if the control is available.
4. **Cooking assistant:** Try a recipe prompt, test available timers, and check microphone permissions if voice input is implemented.
5. **Meal planner:** Generate a plan, try any meal-swap control, and check whether grocery-list items can be marked complete.

---

## 📄 License

MIT License. If you distribute this project, include the applicable MIT license text in a `LICENSE` file.
