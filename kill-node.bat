@echo off
echo ====================================
echo Stopping all Node.js processes...
echo ====================================
echo.

taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Success! All Node.js processes stopped.
    echo.
    echo You can now restart the API server with:
    echo   cd apps\api
    echo   npm run start:dev
) else (
    echo.
    echo No Node.js processes found running.
    echo Port 3000 is available.
)

echo.
echo ====================================
pause
