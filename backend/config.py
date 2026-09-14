import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004").strip()
    
    HOST: str = os.getenv("HOST", "0.0.0.0").strip()
    PORT: int = int(os.getenv("PORT", "8000").strip())
    
    _cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,*")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]
    
    CHROMA_DIR: str = os.getenv("CHROMA_DIR", str(BASE_DIR / "data" / "chroma")).strip()
    DOCUMENTS_DIR: str = os.getenv("DOCUMENTS_DIR", str(BASE_DIR / "data" / "documents")).strip()

settings = Settings()

# Ensure directories exist
Path(settings.CHROMA_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.DOCUMENTS_DIR).mkdir(parents=True, exist_ok=True)
