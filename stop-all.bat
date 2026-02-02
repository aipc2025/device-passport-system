@echo off
echo ==========================================
echo   Device Passport System - Stop All
echo ==========================================
echo.

echo [1/2] Stopping database and Redis...
cd docker
docker-compose down
cd ..
echo OK: Database and Redis stopped

echo.
echo [2/2] Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Node processes stopped
) else (
    echo Info: No running Node processes
)

echo.
echo ==========================================
echo   All services stopped
echo ==========================================
echo.
pause
