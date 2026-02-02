@echo off
echo ==========================================
echo   Device Passport System - Service Check
echo ==========================================
echo.

echo [1/6] Checking Docker service...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Docker service is running
) else (
    echo Error: Docker service is not running
)

echo.
echo [2/6] Checking PostgreSQL database...
docker ps | findstr device-passport-db | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: PostgreSQL database is running
) else (
    echo Error: PostgreSQL database is not running
)

echo.
echo [3/6] Checking Redis cache...
docker ps | findstr device-passport-redis | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Redis cache is running
) else (
    echo Error: Redis cache is not running
)

echo.
echo [4/6] Checking API service (port 3000)...
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: API service is running
    curl -s http://localhost:3000/api/v1 >nul 2>&1
    if %errorlevel% equ 0 (
        echo    API is responding
    ) else (
        echo    Warning: API is not responding
    )
) else (
    echo Error: API service is not running (port 3000)
)

echo.
echo [5/6] Checking Web service (port 5173)...
netstat -ano | findstr ":5173.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Web service is running
) else (
    echo Error: Web service is not running (port 5173)
)

echo.
echo [6/6] Checking Adminer (port 8080)...
netstat -ano | findstr ":8080.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Adminer is running
) else (
    echo Error: Adminer is not running (port 8080)
)

echo.
echo ==========================================
echo   Network Configuration
echo ==========================================
echo.
ipconfig | findstr "IPv4"
echo.

echo ==========================================
echo   Access URLs
echo ==========================================
echo   Local Access:
echo     - Web: http://localhost:5173
echo     - API: http://localhost:3000/api/v1
echo.
echo   LAN Access (use your IP):
echo     - Web: http://192.168.71.21:5173
echo     - API: http://192.168.71.21:3000/api/v1
echo     - Swagger: http://192.168.71.21:3000/api/docs
echo     - Adminer: http://192.168.71.21:8080
echo ==========================================
echo.
pause
