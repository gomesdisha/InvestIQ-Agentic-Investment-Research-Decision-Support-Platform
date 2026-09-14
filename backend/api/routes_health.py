from datetime import datetime
from fastapi import APIRouter
from backend.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    is_gemini_set = bool(
        settings.GOOGLE_API_KEY and 
        settings.GOOGLE_API_KEY.strip() and 
        not settings.GOOGLE_API_KEY.startswith("your_")
    )
    return {
        "status": "healthy",
        "service": "InvestIQ API",
        "gemini_configured": is_gemini_set,
        "gemini_model": settings.GEMINI_MODEL,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
