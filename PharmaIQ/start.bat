@echo off
echo.
echo 🏥 PharmaIQ - Quick Start
echo ==============================
echo.

REM Check Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set "python_version=%%i"
echo ✅ Python found: %python_version%

REM Install dependencies
echo.
echo 📦 Installing dependencies...
cd backend
pip install -q -r requirements.txt

REM Check .env
if not exist .env (
    echo.
    echo ⚠️  .env file not found. Creating template...
    (
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
        echo API_HOST=0.0.0.0
        echo API_PORT=8000
        echo DEBUG=True
    ) > .env
    echo    Edit .env and add your GEMINI_API_KEY
)

REM Start backend
echo.
echo 🚀 Starting PharmaIQ Backend...
echo    Server: http://localhost:8000
echo    Frontend: Open frontend/index.html in your browser
echo    API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
pause
