@echo off

REM Check admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==========================================
    echo   Administrator Rights Required
    echo ==========================================
    echo.
    echo Please right-click this file and select
    echo "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ==========================================
echo   Device Passport System - Firewall Setup
echo ==========================================
echo.
echo Configuring Windows Firewall rules for LAN access...
echo.

echo [1/4] Allowing API port (3000)...
netsh advfirewall firewall delete rule name="Device Passport API" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport API" dir=in action=allow protocol=TCP localport=3000
if %errorlevel% equ 0 (
    echo OK: API port (3000) allowed
) else (
    echo Error: Failed to configure API port
)

echo.
echo [2/4] Allowing Web port (5173)...
netsh advfirewall firewall delete rule name="Device Passport Web" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport Web" dir=in action=allow protocol=TCP localport=5173
if %errorlevel% equ 0 (
    echo OK: Web port (5173) allowed
) else (
    echo Error: Failed to configure Web port
)

echo.
echo [3/4] Allowing Adminer port (8080)...
netsh advfirewall firewall delete rule name="Device Passport Adminer" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport Adminer" dir=in action=allow protocol=TCP localport=8080
if %errorlevel% equ 0 (
    echo OK: Adminer port (8080) allowed
) else (
    echo Error: Failed to configure Adminer port
)

echo.
echo [4/4] Allowing PostgreSQL port (5432)...
netsh advfirewall firewall delete rule name="Device Passport PostgreSQL" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport PostgreSQL" dir=in action=allow protocol=TCP localport=5432
if %errorlevel% equ 0 (
    echo OK: PostgreSQL port (5432) allowed
) else (
    echo Error: Failed to configure PostgreSQL port
)

echo.
echo ==========================================
echo   Firewall configuration complete!
echo ==========================================
echo.
echo Opened ports:
echo   - 3000  (API service)
echo   - 5173  (Web service)
echo   - 8080  (Adminer database management)
echo   - 5432  (PostgreSQL database)
echo.
echo Other devices on LAN can now access:
echo   http://192.168.71.21:5173
echo.
pause
