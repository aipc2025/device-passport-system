# Core Features Quick Test - PowerShell Version
# Device Passport System

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Core Features Quick Test" -ForegroundColor Cyan
Write-Host "  Device Passport System" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$passCount = 0
$failCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )

    Write-Host "Testing: $Name..." -NoNewline

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 5
            ErrorAction = "Stop"
        }

        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }

        $response = Invoke-WebRequest @params

        if ($response.StatusCode -eq 200) {
            Write-Host " PASSED" -ForegroundColor Green
            $script:passCount++
            return @{
                Test = $Name
                Status = "PASSED"
                StatusCode = $response.StatusCode
                Response = $response.Content
            }
        } else {
            Write-Host " FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failCount++
            return @{
                Test = $Name
                Status = "FAILED"
                StatusCode = $response.StatusCode
                Error = "Unexpected status code"
            }
        }
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        $script:failCount++
        return @{
            Test = $Name
            Status = "FAILED"
            Error = $_.Exception.Message
        }
    }
}

# Test 1: Backend API Availability
Write-Host "[1/9] Checking Backend API..." -ForegroundColor Yellow
$result = Test-Endpoint -Name "Backend API Availability" -Url "http://localhost:3000/api/health"
$testResults += $result
Write-Host ""

# Test 2: Health Check Endpoint
Write-Host "[2/9] Testing Health Check..." -ForegroundColor Yellow
$result = Test-Endpoint -Name "Health Check Endpoint" -Url "http://localhost:3000/api/health"
if ($result.Status -eq "PASSED") {
    $healthData = $result.Response | ConvertFrom-Json
    Write-Host "  Database: $($healthData.details.database.status)" -ForegroundColor Gray
    Write-Host "  Redis: $($healthData.details.redis.status)" -ForegroundColor Gray
    Write-Host "  Memory: $($healthData.details.memory_heap.status)" -ForegroundColor Gray
}
$testResults += $result
Write-Host ""

# Test 3: Public Scan Endpoint
Write-Host "[3/9] Testing Public Scan..." -ForegroundColor Yellow
$result = Test-Endpoint -Name "Public Scan Endpoint" -Url "http://localhost:3000/api/v1/scan/DP-MED-2601-PF-CN-000001-0A"
$testResults += $result
Write-Host ""

# Test 4: API Documentation
Write-Host "[4/9] Testing API Docs..." -ForegroundColor Yellow
$result = Test-Endpoint -Name "Swagger API Documentation" -Url "http://localhost:3000/api/docs"
$testResults += $result
Write-Host ""

# Test 5: Login Endpoint
Write-Host "[5/9] Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@luna.top"
    password = "password123"
} | ConvertTo-Json

$result = Test-Endpoint -Name "Login Endpoint" -Url "http://localhost:3000/api/v1/auth/login" -Method "POST" -Body $loginBody
if ($result.Status -eq "PASSED") {
    $loginData = $result.Response | ConvertFrom-Json
    $accessToken = $loginData.access_token
    Write-Host "  Access Token: Obtained" -ForegroundColor Gray
}
$testResults += $result
Write-Host ""

# Test 6: Protected Endpoint (Passport List)
Write-Host "[6/9] Testing Protected Endpoint..." -ForegroundColor Yellow
if ($accessToken) {
    $authHeaders = @{
        "Authorization" = "Bearer $accessToken"
    }
    $result = Test-Endpoint -Name "Passport List (Authenticated)" -Url "http://localhost:3000/api/v1/passports" -Headers $authHeaders
} else {
    Write-Host " SKIPPED (No access token)" -ForegroundColor Yellow
    $result = @{
        Test = "Passport List (Authenticated)"
        Status = "SKIPPED"
        Error = "Login failed - no access token"
    }
}
$testResults += $result
Write-Host ""

# Test 7: Expert List Endpoint
Write-Host "[7/9] Testing Expert List..." -ForegroundColor Yellow
if ($accessToken) {
    $result = Test-Endpoint -Name "Expert List Endpoint" -Url "http://localhost:3000/api/v1/experts" -Headers $authHeaders
} else {
    Write-Host " SKIPPED (No access token)" -ForegroundColor Yellow
    $result = @{
        Test = "Expert List Endpoint"
        Status = "SKIPPED"
        Error = "Login failed - no access token"
    }
}
$testResults += $result
Write-Host ""

# Test 8: Frontend Availability
Write-Host "[8/9] Testing Frontend..." -ForegroundColor Yellow
$result = Test-Endpoint -Name "Frontend Availability" -Url "http://localhost:5173"
$testResults += $result
Write-Host ""

# Test 9: WebSocket Server
Write-Host "[9/9] Testing WebSocket..." -ForegroundColor Yellow
try {
    $wsTest = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
    if ($wsTest.TcpTestSucceeded) {
        Write-Host "Testing: WebSocket Server... PASSED" -ForegroundColor Green
        $passCount++
        $testResults += @{
            Test = "WebSocket Server"
            Status = "PASSED"
            Port = 3001
        }
    } else {
        Write-Host "Testing: WebSocket Server... FAILED" -ForegroundColor Red
        $failCount++
        $testResults += @{
            Test = "WebSocket Server"
            Status = "FAILED"
            Error = "Port 3001 not accessible"
        }
    }
} catch {
    Write-Host "Testing: WebSocket Server... FAILED" -ForegroundColor Red
    $failCount++
    $testResults += @{
        Test = "WebSocket Server"
        Status = "FAILED"
        Error = $_.Exception.Message
    }
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($passCount + $failCount)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "SUCCESS: All core features are working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor White
    Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  API Docs:  http://localhost:3000/api/docs" -ForegroundColor Cyan
    Write-Host "  Health:    http://localhost:3000/api/health" -ForegroundColor Cyan
    Write-Host "  WebSocket: ws://localhost:3001" -ForegroundColor Cyan
} else {
    Write-Host "WARNING: Some tests failed!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor White
    Write-Host "  1. Ensure all services are running: start-all.bat" -ForegroundColor Gray
    Write-Host "  2. Check database is seeded: pnpm db:seed" -ForegroundColor Gray
    Write-Host "  3. Review error details above" -ForegroundColor Gray
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Export detailed results to JSON
$testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath "test-results.json" -Encoding UTF8
Write-Host ""
Write-Host "Detailed results saved to: test-results.json" -ForegroundColor Gray
Write-Host ""
