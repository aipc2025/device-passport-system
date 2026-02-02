@echo off
echo ==========================================
echo   Device Passport System - Web Frontend
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/2] Checking API server...
curl -s http://localhost:3000/api/v1 >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: API server may not be running
    echo Please run start-server.bat first
    echo.
)

echo [2/2] Starting Web server...
echo.
echo ==========================================
echo   Web Access URLs:
echo   - Local: http://localhost:5173
echo   - LAN: http://192.168.71.21:5173
echo ==========================================
echo.
echo Tips:
echo   1. Make sure API server is running (start-server.bat)
echo   2. Other devices on LAN can access via IP address
echo   3. Press Ctrl+C to stop the server
echo   4. See START-GUIDE.md for details
echo.
echo Starting Web server...
echo.

cd apps\web
call npm run dev -- --host 0.0.0.0
