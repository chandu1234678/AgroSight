from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    
    DEBUG: bool = False
    APP_NAME: str = "AgroSight API"
    APP_VERSION: str = "1.0.0"
    
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./agrosight.db"
    
    # Security & JWT
    SECRET_KEY: str  
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    GEMINI_API_KEY: Optional[str] = None
    CEREBRAS_API_KEY: Optional[str] = None
    
    # File Storage (
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    UPLOAD_DIR: str = "./uploads"  # Used if STORAGE_TYPE == "local"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # ML Model (TFLite)
    MODEL_PATH: str = "./ml/saved_models/plant_disease_model.tflite"
    CONFIDENCE_THRESHOLD: float = 0.7  # Return "uncertain" if < 70%
    CLASS_NAMES_PATH: str = "./ml/saved_models/class_names.json"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
