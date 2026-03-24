# AgroSight Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (for production)
- Git

## Quick Start

### 1. Environment Setup

Copy environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- SECRET_KEY (generate with: `openssl rand -hex 32`)
- GEMINI_API_KEY
- CEREBRAS_API_KEY
- CLOUDINARY_URL or AWS credentials

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows bash
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

### 4. ML Model Training (Optional)

```bash
cd backend/ml

# ML dependencies are included in backend/requirements.txt

# Download datasets (see backend/ml/datasets/README.md)

# Train model
python training/train.py

# Evaluate model
python training/evaluate.py
```

## Docker Deployment

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

## Database Migrations

Create new migration:
```bash
cd backend
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

## Production Deployment

1. Set DATABASE_URL to PostgreSQL
2. Set strong SECRET_KEY
3. Configure cloud storage (Cloudinary/S3)
4. Build frontend: `npm run build`
5. Use production WSGI server (gunicorn)
6. Set up reverse proxy (nginx)
7. Enable HTTPS

## Testing

Backend:
```bash
pytest
```

Frontend:
```bash
npm test
```

## Troubleshooting

- Port conflicts: Change ports in .env and vite.config.js
- Database errors: Check DATABASE_URL and run migrations
- CORS issues: Verify FRONTEND_URL in .env
- Model loading: Ensure MODEL_PATH points to trained model
