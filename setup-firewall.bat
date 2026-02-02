@echo off
chcp 65001 >nul

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==========================================
    echo   需要管理员权限
    echo ==========================================
    echo.
    echo 请右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo ==========================================
echo   设备护照系统 - 防火墙配置
echo ==========================================
echo.
echo 正在配置Windows防火墙规则，允许局域网访问...
echo.

echo [1/4] 允许API端口 (3000)...
netsh advfirewall firewall delete rule name="Device Passport API" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport API" dir=in action=allow protocol=TCP localport=3000
if %errorlevel% equ 0 (
    echo ✅ API端口 (3000) 已允许
) else (
    echo ❌ API端口配置失败
)

echo.
echo [2/4] 允许Web端口 (5173)...
netsh advfirewall firewall delete rule name="Device Passport Web" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport Web" dir=in action=allow protocol=TCP localport=5173
if %errorlevel% equ 0 (
    echo ✅ Web端口 (5173) 已允许
) else (
    echo ❌ Web端口配置失败
)

echo.
echo [3/4] 允许Adminer端口 (8080)...
netsh advfirewall firewall delete rule name="Device Passport Adminer" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport Adminer" dir=in action=allow protocol=TCP localport=8080
if %errorlevel% equ 0 (
    echo ✅ Adminer端口 (8080) 已允许
) else (
    echo ❌ Adminer端口配置失败
)

echo.
echo [4/4] 允许PostgreSQL端口 (5432)...
netsh advfirewall firewall delete rule name="Device Passport PostgreSQL" >nul 2>&1
netsh advfirewall firewall add rule name="Device Passport PostgreSQL" dir=in action=allow protocol=TCP localport=5432
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL端口 (5432) 已允许
) else (
    echo ❌ PostgreSQL端口配置失败
)

echo.
echo ==========================================
echo   防火墙配置完成！
echo ==========================================
echo.
echo 已开放的端口：
echo   - 3000  (API服务)
echo   - 5173  (Web服务)
echo   - 8080  (Adminer数据库管理)
echo   - 5432  (PostgreSQL数据库)
echo.
echo 局域网内其他设备现在可以访问：
echo   http://192.168.71.21:5173
echo.
pause
