from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./agrosight.db"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    GEMINI_API_KEY: Optional[str] = None
    CEREBRAS_API_KEY: Optional[str] = None
    
    # Storage
    CLOUDINARY_URL: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # ML Model
    MODEL_PATH: str = "./ml/saved_models/resnet_plant_disease.pth"
    CONFIDENCE_THRESHOLD: float = 0.7
    CLASS_NAMES_PATH: str = "./ml/saved_models/class_names.json"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
