@echo off
echo ==========================================
echo   Device Passport System - API Server
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/4] Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running
    echo Please start Docker Desktop first
    pause
    exit /b 1
)
echo OK: Docker is running

echo.
echo [2/4] Starting database and Redis...
cd docker
docker-compose up -d
if %errorlevel% neq 0 (
    echo Error: Failed to start database
    cd ..
    pause
    exit /b 1
)
cd ..
echo OK: Database and Redis started

echo.
echo [3/4] Waiting for database to be ready...
timeout /t 5 /nobreak >nul
echo OK: Database is ready

echo.
echo [4/4] Starting API server...
echo.
echo ==========================================
echo   API Access URLs:
echo   - Local: http://localhost:3000/api/v1
echo   - LAN: http://192.168.71.21:3000/api/v1
echo   - Swagger: http://192.168.71.21:3000/api/docs
echo ==========================================
echo.
echo Tips:
echo   1. Run start-web.bat in a new window to start frontend
echo   2. Press Ctrl+C to stop the server
echo   3. See START-GUIDE.md for detailed instructions
echo.
echo Starting API server...
echo.

cd apps\api
call npm run start:dev
