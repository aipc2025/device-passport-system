@echo off
chcp 65001 >nul
echo ==========================================
echo   设备护照系统 - 停止所有服务
echo ==========================================
echo.

echo [1/2] 停止数据库和Redis...
cd docker
docker-compose down
cd ..
echo ✅ 数据库和Redis已停止

echo.
echo [2/2] 停止Node进程...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node进程已停止
) else (
    echo ℹ️  没有运行中的Node进程
)

echo.
echo ==========================================
echo   所有服务已停止
echo ==========================================
echo.
pause
