@echo off
chcp 65001 >nul
echo ==========================================
echo   设备护照系统 - 一键启动
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/3] 检查Docker服务状态...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker服务未启动，请先启动Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker服务运行正常

echo.
echo [2/3] 启动数据库和Redis...
cd docker
docker-compose up -d
cd ..
echo ✅ 数据库和Redis已启动

echo.
echo [3/3] 启动服务...
echo.
echo ==========================================
echo   系统访问地址：
echo ==========================================
echo   📱 Web界面（前端）：
echo      - http://localhost:5173
echo      - http://192.168.71.21:5173 （局域网）
echo.
echo   🔧 API服务（后端）：
echo      - http://localhost:3000/api/v1
echo      - http://192.168.71.21:3000/api/v1 （局域网）
echo.
echo   📖 API文档（Swagger）：
echo      - http://192.168.71.21:3000/api/docs
echo.
echo   💾 数据库管理（Adminer）：
echo      - http://192.168.71.21:8080
echo ==========================================
echo.
echo 🔥 正在启动API服务器...
echo    （Web服务将在新窗口自动启动）
echo.
echo 📝 提示：
echo    - 按 Ctrl+C 可停止服务
echo    - 完整说明请查看 START-GUIDE.md
echo.

REM 在新窗口启动Web服务器
start "Device Passport - Web" cmd /k "cd /d %~dp0 && start-web.bat"

REM 等待2秒让Web窗口先启动
timeout /t 2 /nobreak >nul

REM 在当前窗口启动API服务器
cd apps\api
call npm run start:dev
