@echo off
echo ==========================================
echo   Device Passport System - Start All
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/3] Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo OK: Docker is running

echo.
echo [2/3] Starting database and Redis...
cd docker
docker-compose up -d
cd ..
echo OK: Database and Redis started

echo.
echo [3/3] Starting services...
echo.
echo ==========================================
echo   Access URLs:
echo ==========================================
echo   Web Frontend:
echo      - http://localhost:5173
echo      - http://192.168.71.21:5173 (LAN)
echo.
echo   API Backend:
echo      - http://localhost:3000/api/v1
echo      - http://192.168.71.21:3000/api/v1 (LAN)
echo.
echo   API Documentation:
echo      - http://192.168.71.21:3000/api/docs
echo.
echo   Database Admin:
echo      - http://192.168.71.21:8080
echo ==========================================
echo.
echo Starting API server...
echo Web server will start in a new window
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Web in new window
start "Device Passport - Web" cmd /k "cd /d %~dp0 && start-web.bat"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start API in current window
cd apps\api
call npm run start:dev
