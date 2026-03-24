# 🌾 AgroSight - AI-Powered Plant Disease Detection

Production-ready full-stack application for detecting plant diseases using deep learning.

## 🚀 Tech Stack

### Backend
- FastAPI (async Python framework)
- PyTorch (ResNet-based CNN)
- SQLAlchemy ORM + Alembic migrations
- SQLite (dev) → PostgreSQL (production)
- JWT authentication with bcrypt

### Frontend
- React + Vite
- Axios for API calls
- Context API for state management

### ML Pipeline
- ResNet18/34 with transfer learning
- PlantVillage + PlantDoc datasets
- Advanced augmentation pipeline

### External APIs
- Google Gemini API (detailed explanations)
- Cerebras API (fast chat responses)

## 📁 Project Structure

```
agrosight/
├── backend/          # FastAPI application + ML pipeline
│   ├── app/         # FastAPI code
│   └── ml/          # ML training & models
├── frontend/         # React + Vite
├── docs/            # Documentation
└── docker-compose.yml
```

## 🛠️ Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows bash
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### ML Training

```bash
cd backend/ml
pip install -r requirements.txt

# Download datasets (see backend/ml/datasets/README.md)
# Train model
python training/train.py
```

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

All services (backend + ML, frontend, PostgreSQL) run in containers.

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

## 📊 Dataset Pipeline

1. PlantVillage → Initial training
2. Class balancing → Filter dataset
3. PlantDoc → Real-world fine-tuning
4. Custom data → Final tuning

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=postgresql://user:pass@localhost/agrosight
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
CEREBRAS_API_KEY=your-cerebras-key
CLOUDINARY_URL=your-cloudinary-url
```

## 📚 Documentation

- [Architecture](docs/architecture.md)
- [ML Pipeline](docs/ml_pipeline.md)
- [API Endpoints](docs/api_endpoints.md)

## 🎯 Core Features

- 🔍 Plant disease detection via image upload
- 📊 User dashboard with scan history
- 💬 AI chat assistant (Gemini + Cerebras)
- 🔐 JWT authentication
- 📈 Disease severity analysis
- 🌐 Production-ready deployment

## 📝 License

MIT
