@echo off
chcp 65001 >nul
echo ==========================================
echo   设备护照系统 - 服务状态检查
echo ==========================================
echo.

echo [1/6] 检查Docker服务...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker服务运行正常
) else (
    echo ❌ Docker服务未运行
)

echo.
echo [2/6] 检查PostgreSQL数据库...
docker ps | findstr device-passport-db | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL数据库运行正常
) else (
    echo ❌ PostgreSQL数据库未运行
)

echo.
echo [3/6] 检查Redis缓存...
docker ps | findstr device-passport-redis | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis缓存运行正常
) else (
    echo ❌ Redis缓存未运行
)

echo.
echo [4/6] 检查API服务 (端口3000)...
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API服务运行正常
    curl -s http://localhost:3000/api/v1 >nul 2>&1
    if %errorlevel% equ 0 (
        echo    └─ API响应正常
    ) else (
        echo    └─ ⚠️  API未响应
    )
) else (
    echo ❌ API服务未运行（端口3000未监听）
)

echo.
echo [5/6] 检查Web服务 (端口5173)...
netstat -ano | findstr ":5173.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Web服务运行正常
) else (
    echo ❌ Web服务未运行（端口5173未监听）
)

echo.
echo [6/6] 检查Adminer (端口8080)...
netstat -ano | findstr ":8080.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Adminer运行正常
) else (
    echo ❌ Adminer未运行（端口8080未监听）
)

echo.
echo ==========================================
echo   网络配置信息
echo ==========================================
echo.
ipconfig | findstr "IPv4"
echo.

echo ==========================================
echo   访问地址
echo ==========================================
echo   本机访问：
echo     - Web: http://localhost:5173
echo     - API: http://localhost:3000/api/v1
echo.
echo   局域网访问（使用本机IP）：
echo     - Web: http://192.168.71.21:5173
echo     - API: http://192.168.71.21:3000/api/v1
echo     - Swagger: http://192.168.71.21:3000/api/docs
echo     - Adminer: http://192.168.71.21:8080
echo ==========================================
echo.
pause
