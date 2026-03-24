@echo off
echo ============================================================
echo Installing Google Gemini API for AgroSight
echo ============================================================
echo.

cd backend

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing google-generativeai package...
pip install google-generativeai

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Get your free API key from: https://aistudio.google.com/apikey
echo 2. Add it to backend/.env: GEMINI_API_KEY=your_key_here
echo 3. Restart the backend server
echo.
echo See GEMINI_SETUP.md for detailed instructions
echo.
pause
