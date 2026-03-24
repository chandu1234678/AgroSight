from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database import init_db, close_db
from app.api.routes import auth, scan, chat, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Async context manager for app startup and shutdown.
    Initializes database tables and closes connections.
    """
    # Startup: Create tables
    await init_db()
    yield
    # Shutdown: Close database pool
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered plant disease detection system",
    version=settings.APP_VERSION,
    lifespan=lifespan,  # Async startup/shutdown
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(scan.router, prefix="/api/scan", tags=["Scan"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AgroSight API"}
