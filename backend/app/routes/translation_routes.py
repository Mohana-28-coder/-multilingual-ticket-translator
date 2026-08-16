from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas
from ..auth import get_current_user
from ..services.translation_service import translation_service, LANGUAGE_NAMES

router = APIRouter(prefix="/api/translation", tags=["Translation"])

@router.post("/detect")
async def detect_language(request: dict):
    text = request.get("text", "")
    lang_code, lang_name, confidence = translation_service.detect_language(text)
    
    return {
        "text": text[:100] + "..." if len(text) > 100 else text,
        "detected_language": lang_code,
        "language_name": lang_name,
        "confidence": confidence
    }

@router.post("/translate")
async def translate_text(request: schemas.TranslationRequest):
    translated, source_lang = translation_service.translate_text(
        request.text,
        target_language=request.target_language,
        source_language=request.source_language
    )
    
    return {
        "original_text": request.text,
        "translated_text": translated,
        "source_language": source_lang,
        "target_language": request.target_language
    }

@router.get("/languages")
async def get_supported_languages():
    return {
        "languages": [
            {"code": code, "name": name}
            for code, name in LANGUAGE_NAMES.items()
        ]
    }