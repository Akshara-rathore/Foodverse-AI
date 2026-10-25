import io
import json
import logging
import re
from typing import Dict, Any, Optional, List, Tuple
from PIL import Image
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("foodverse.gemini")

DEFAULT_CANDIDATES = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-pro"
]

class GeminiService:
    def __init__(self):
        self._configured = False
        self._active_model = settings.GEMINI_MODEL or "gemini-1.5-flash-latest"
        self._cached_supported_models: List[str] = []
        self.last_error = None

        if settings.has_gemini_key:
            self._init_client(settings.GEMINI_API_KEY)

    def _init_client(self, api_key: str):
        try:
            genai.configure(api_key=api_key)
            self._configured = True
            self.last_error = None
            self._discover_available_models()
            logger.info(f"Gemini AI configured successfully. Selected model: {self._active_model}")
        except Exception as e:
            logger.warning(f"Failed to configure Gemini AI: {e}")
            self._configured = False
            self.last_error = str(e)

    def _discover_available_models(self):
        """Query genai.list_models() to find models that support generateContent."""
        try:
            available = []
            for m in genai.list_models():
                methods = getattr(m, "supported_generation_methods", [])
                if "generateContent" in methods:
                    available.append(m.name)
            
            self._cached_supported_models = available
            if available:
                logger.info(f"Discovered {len(available)} available Gemini models for this key: {available}")
                # Pick the best model (prefer flash, then pro)
                for name in available:
                    clean = name.replace("models/", "")
                    if "1.5-flash" in clean or "2.0-flash" in clean:
                        self._active_model = clean
                        return
                for name in available:
                    clean = name.replace("models/", "")
                    if "1.5-pro" in clean or "gemini" in clean:
                        self._active_model = clean
                        return
                self._active_model = available[0].replace("models/", "")
        except Exception as e:
            logger.warning(f"Could not list available Gemini models automatically: {e}")
            self._cached_supported_models = []

    @property
    def is_live_ai_available(self) -> bool:
        return self._configured and settings.has_gemini_key

    def update_api_key(self, api_key: str):
        settings.GEMINI_API_KEY = api_key.strip()
        self.last_error = None
        if settings.has_gemini_key:
            self._init_client(settings.GEMINI_API_KEY)
            return self._configured
        else:
            self._configured = False
            return True

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON safely from model response text."""
        if not text:
            return None
        text = text.strip()

        # Direct parse attempt
        try:
            return json.loads(text)
        except Exception:
            pass

        # Strip markdown ```json code blocks
        clean_text = text
        if "```json" in clean_text:
            parts = clean_text.split("```json")
            if len(parts) > 1:
                clean_text = parts[1].split("```")[0]
        elif "```" in clean_text:
            parts = clean_text.split("```")
            if len(parts) > 1:
                clean_text = parts[1]

        try:
            return json.loads(clean_text.strip())
        except Exception:
            pass

        # Regex search for outer matching braces { ... }
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        return None

    def _get_model_candidates(self) -> List[str]:
        """Build prioritized candidate model list."""
        candidates = []
        if self._active_model:
            candidates.append(self._active_model)
            if not self._active_model.startswith("models/"):
                candidates.append(f"models/{self._active_model}")

        # Add models discovered via list_models
        for m in self._cached_supported_models:
            clean = m.replace("models/", "")
            if clean not in candidates:
                candidates.append(clean)
            if m not in candidates:
                candidates.append(m)

        # Add default fallback candidates
        for c in DEFAULT_CANDIDATES:
            if c not in candidates:
                candidates.append(c)

        return candidates

    async def generate_multimodal_analysis(
        self,
        prompt: str,
        image_bytes: Optional[bytes] = None,
        mime_type: str = "image/jpeg",
        system_instruction: Optional[str] = None
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Call Gemini multimodal API with automatic model candidate fallback."""
        if not self.is_live_ai_available:
            return None, "Google Gemini API key not configured"

        # Prepare image content
        contents = []
        if image_bytes:
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                contents.append(pil_img)
            except Exception:
                contents.append({
                    "mime_type": mime_type or "image/jpeg",
                    "data": image_bytes
                })
        contents.append(prompt)

        candidates = self._get_model_candidates()
        last_exception_msg = None

        for model_name in candidates:
            try:
                logger.info(f"Attempting Gemini multimodal call using model candidate: {model_name}")
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                response = await model.generate_content_async(contents)
                raw_text = response.text or ""
                parsed = self._extract_json(raw_text)
                if parsed:
                    # Remember this working model for future calls!
                    self._active_model = model_name.replace("models/", "")
                    logger.info(f"Gemini multimodal call succeeded using model: {model_name}")
                    return parsed, None
                last_exception_msg = "Model returned response text, but it could not be parsed into nutritional JSON format."
            except Exception as e:
                err_str = str(e)
                last_exception_msg = err_str
                logger.warning(f"Gemini candidate '{model_name}' failed: {err_str}")
                # If 404 model not found or unsupported, continue to next candidate
                if "404" in err_str or "not found" in err_str.lower() or "supported" in err_str.lower():
                    continue
                # For other errors (e.g. quota, auth), break or keep trying
                if "quota" in err_str.lower() or "api_key" in err_str.lower() or "permission" in err_str.lower():
                    break

        return None, last_exception_msg or "Failed to generate analysis with any Gemini model candidate."

    async def generate_text_chat(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        """Call Gemini text for chat with automatic model fallback."""
        if not self.is_live_ai_available:
            return None

        candidates = self._get_model_candidates()
        for model_name in candidates:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                chat = model.start_chat()
                if history:
                    for item in history:
                        chat.history.append({
                            "role": "user" if item.get("role") == "user" else "model",
                            "parts": [item.get("content", "")]
                        })
                response = await chat.send_message_async(prompt)
                self._active_model = model_name.replace("models/", "")
                return response.text
            except Exception as e:
                logger.warning(f"Gemini chat candidate '{model_name}' failed: {e}")
                if "404" in str(e) or "not found" in str(e).lower():
                    continue
                break
        return None

gemini_service = GeminiService()
