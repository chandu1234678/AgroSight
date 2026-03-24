from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DEBUG: bool = False
    APP_NAME: str = "AgroSight API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./agrosight.db"
    
    SECRET_KEY: str  
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    GEMINI_API_KEY: Optional[str] = None
    CEREBRAS_API_KEY: Optional[str] = None
    
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    MODEL_PATH: str = "./ml/saved_models/resnet34_plant_disease_best.pth"
    CONFIDENCE_THRESHOLD: float = 0.7
    CLASS_NAMES_PATH: str = "./ml/saved_models/class_names.json"
    
    FRONTEND_URL: str = "http://localhost:5173"
    
    REDIS_URL: Optional[str] = None
    SENTRY_DSN: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
