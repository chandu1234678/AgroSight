@echo off
echo ============================================================
echo Restarting AgroSight Backend with Gemini AI
echo ============================================================
echo.
echo Press Ctrl+C in the backend terminal to stop it first
echo Then run this script
echo.
pause

cd backend
echo.
echo Starting backend server...
echo.
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
