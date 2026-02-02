@echo off
echo ==========================================
echo   E2E Test Runner
echo   Device Passport System
echo ==========================================
echo.

REM Check if services are running
echo [1/5] Checking if services are running...
curl -s http://localhost:3000/api/v1/scan/test >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend API is not running!
    echo Please start services first:
    echo    1. Run start-all.bat in another window
    echo    2. Wait for services to start
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)
echo OK: Backend API is running

curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Frontend is not running!
    echo Please start services first:
    echo    1. Run start-all.bat in another window
    echo    2. Wait for services to start
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)
echo OK: Frontend is running

echo.
echo [2/5] Preparing test database...
cd apps\api
call npm run db:reset >nul 2>&1
call npm run migration:run >nul 2>&1
call npm run seed >nul 2>&1
cd ..\..
echo OK: Test database ready

echo.
echo [3/5] Installing Playwright browsers (first time only)...
call npx playwright install >nul 2>&1
echo OK: Browsers installed

echo.
echo [4/5] Running E2E tests...
echo This may take 5-10 minutes...
echo.

REM Run tests
call pnpm test:e2e

echo.
echo [5/5] Test Results
echo ==========================================
if %errorlevel% equ 0 (
    echo STATUS: ALL TESTS PASSED!
    echo View detailed report: pnpm test:e2e:report
) else (
    echo STATUS: SOME TESTS FAILED
    echo.
    echo Common issues:
    echo   1. Services not fully started - wait 30s and retry
    echo   2. Port conflicts - check if ports 3000/5173 are in use
    echo   3. Database not seeded - run: pnpm db:seed
    echo.
    echo View detailed report: pnpm test:e2e:report
)
echo ==========================================
echo.
pause
