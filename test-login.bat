@echo off
echo ====================================
echo Testing Login API
echo ====================================
echo.

echo Testing API health check...
curl -s http://localhost:3000/api/v1/health
echo.
echo.

echo Testing login with admin@luna.top...
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@luna.top\",\"password\":\"DevTest2026!@#$\"}"
echo.
echo.

echo ====================================
echo Test complete
echo ====================================
pause
