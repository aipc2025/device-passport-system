@echo off
echo ==========================================
echo   Core Features Quick Test
echo   Device Passport System
echo ==========================================
echo.

REM Check if services are running
echo [1/7] Checking if backend API is running...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo FAILED: Backend API is not running on port 3000
    echo Please start services first: start-all.bat
    echo.
    pause
    exit /b 1
)
echo PASSED: Backend API is running
echo.

REM Test 1: Health Check
echo [2/7] Testing Health Check Endpoint...
curl -s http://localhost:3000/api/health > nul
if %errorlevel% equ 0 (
    echo PASSED: Health check endpoint responding
) else (
    echo FAILED: Health check endpoint not responding
)
echo.

REM Test 2: Public Scan Endpoint
echo [3/7] Testing Public Scan Endpoint...
curl -s "http://localhost:3000/api/v1/scan/DP-MED-2601-PF-CN-000001-0A" -H "Accept: application/json" > nul
if %errorlevel% equ 0 (
    echo PASSED: Public scan endpoint responding
) else (
    echo FAILED: Public scan endpoint not responding
)
echo.

REM Test 3: API Documentation
echo [4/7] Testing API Documentation (Swagger)...
curl -s http://localhost:3000/api/docs > nul
if %errorlevel% equ 0 (
    echo PASSED: Swagger documentation accessible
) else (
    echo FAILED: Swagger documentation not accessible
)
echo.

REM Test 4: Frontend Accessibility
echo [5/7] Testing Frontend Accessibility...
curl -s http://localhost:5173 > nul
if %errorlevel% equ 0 (
    echo PASSED: Frontend is accessible
) else (
    echo WARNING: Frontend may not be running on port 5173
)
echo.

REM Test 5: Login Endpoint (with test credentials)
echo [6/7] Testing Login Endpoint...
curl -s -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@luna.top\",\"password\":\"password123\"}" ^
  -o test-login-response.json 2>nul

if %errorlevel% equ 0 (
    echo PASSED: Login endpoint responding
    echo NOTE: Check test-login-response.json for details
) else (
    echo FAILED: Login endpoint not responding
)
echo.

REM Test 6: Database Connectivity
echo [7/7] Testing Database Connectivity (via health check)...
curl -s http://localhost:3000/api/health -H "Accept: application/json" | findstr /C:"database" >nul 2>&1
if %errorlevel% equ 0 (
    echo PASSED: Database health check responding
) else (
    echo WARNING: Database health status unclear
)
echo.

REM Cleanup
if exist test-login-response.json (
    del test-login-response.json >nul 2>&1
)

echo ==========================================
echo   Test Summary
echo ==========================================
echo.
echo All core features tested!
echo.
echo If all tests passed:
echo   - System is ready for use
echo   - You can access:
echo     * Frontend: http://localhost:5173
echo     * API Docs: http://localhost:3000/api/docs
echo     * Health: http://localhost:3000/api/health
echo.
echo If any tests failed:
echo   1. Ensure all services are running (start-all.bat)
echo   2. Check if database is seeded (pnpm db:seed)
echo   3. Review logs for error details
echo.
echo ==========================================
pause
