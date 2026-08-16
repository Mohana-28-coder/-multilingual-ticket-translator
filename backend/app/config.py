from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    APP_NAME: str = "Multilingual Ticket Translator"
    SECRET_KEY: str = "your-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "sqlite:///./tickets.db"
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {".pdf", ".png", ".jpg", ".jpeg", ".gif", ".doc", ".docx", ".txt", ".xlsx", ".csv"}

    # AI Settings
    USE_LOCAL_AI: bool = False
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
