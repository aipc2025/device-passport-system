@echo off
chcp 65001 >nul
echo ==========================================
echo   设备护照系统 - 前端启动脚本
echo   Server IP: 192.168.71.21
echo ==========================================
echo.

echo [1/2] 检查API服务是否运行...
curl -s http://localhost:3000/api/v1 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告：API服务可能未启动
    echo    请先运行 start-server.bat 启动API服务器
    echo.
)

echo [2/2] 启动前端Web服务...
echo.
echo ==========================================
echo   Web访问地址：
echo   - 本机: http://localhost:5173
echo   - 局域网: http://192.168.71.21:5173
echo ==========================================
echo.
echo 📝 提示：
echo   1. 确保API服务器已启动（运行start-server.bat）
echo   2. 局域网内其他设备可通过IP访问
echo   3. 按 Ctrl+C 可停止Web服务器
echo   4. 详细说明请查看 START-GUIDE.md
echo.
echo 正在启动Web服务器...
echo.

cd apps\web
call npm run dev -- --host 0.0.0.0
