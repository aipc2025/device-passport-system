@echo off
chcp 65001 >nul
echo ==========================================
echo   设备护照系统 - 服务器启动脚本
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/4] 检查Docker服务状态...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker服务未启动，请先启动Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker服务运行正常

echo.
echo [2/4] 启动数据库和Redis...
cd docker
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ 数据库启动失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ 数据库和Redis已启动

echo.
echo [3/4] 等待数据库就绪...
timeout /t 5 /nobreak >nul
echo ✅ 数据库已就绪

echo.
echo [4/4] 启动API服务器...
echo.
echo ==========================================
echo   API访问地址：
echo   - 本机: http://localhost:3000/api/v1
echo   - 局域网: http://192.168.71.21:3000/api/v1
echo   - Swagger: http://192.168.71.21:3000/api/docs
echo ==========================================
echo.
echo 📝 提示：
echo   1. 请在新窗口运行 start-web.bat 启动前端
echo   2. 按 Ctrl+C 可停止API服务器
echo   3. 详细说明请查看 START-GUIDE.md
echo.
echo 正在启动API服务器...
echo.

cd apps\api
call npm run start:dev
