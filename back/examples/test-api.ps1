# Test script for MIC-1 Backend API (Windows PowerShell version)
# This script demonstrates how to use the API endpoints

$API_URL = "http://localhost:3000/api/mic1"

Write-Host "=== MIC-1 Backend API Test ===" -ForegroundColor Green
Write-Host

# 1. Create a new session
Write-Host "1. Creating new session..." -ForegroundColor Yellow
try {
    $sessionResponse = Invoke-RestMethod -Uri "$API_URL/session" -Method Post -ContentType "application/json"
    $sessionId = $sessionResponse.sessionId
    Write-Host "Session ID: $sessionId" -ForegroundColor Cyan
}
catch {
    Write-Host "Error creating session: $_" -ForegroundColor Red
    exit 1
}
Write-Host

# 2. Parse a simple program
Write-Host "2. Parsing program..." -ForegroundColor Yellow
$parseBody = @{
    sessionId = $sessionId
    program = "LOCO 10`nSTOD 100`nLODD 100`nADDD 100"
} | ConvertTo-Json

try {
    $parseResponse = Invoke-RestMethod -Uri "$API_URL/parse" -Method Post -Body $parseBody -ContentType "application/json"
    Write-Host "Parse result: $($parseResponse | ConvertTo-Json -Compress)" -ForegroundColor Cyan
}
catch {
    Write-Host "Error parsing program: $_" -ForegroundColor Red
}
Write-Host

# 3. Load the program
Write-Host "3. Loading program..." -ForegroundColor Yellow
$loadBody = @{
    sessionId = $sessionId
    program = @{
        instructions = @("LOCO 10", "STOD 100", "LODD 100", "ADDD 100")
        data = @{}
    }
} | ConvertTo-Json -Depth 3

try {
    $loadResponse = Invoke-RestMethod -Uri "$API_URL/load" -Method Post -Body $loadBody -ContentType "application/json"
    Write-Host "Load result: $($loadResponse | ConvertTo-Json -Compress)" -ForegroundColor Cyan
}
catch {
    Write-Host "Error loading program: $_" -ForegroundColor Red
}
Write-Host

# 4. Execute the program
Write-Host "4. Executing program..." -ForegroundColor Yellow
$executeBody = @{
    sessionId = $sessionId
    stepMode = $false
} | ConvertTo-Json

try {
    $executeResponse = Invoke-RestMethod -Uri "$API_URL/execute" -Method Post -Body $executeBody -ContentType "application/json"
    Write-Host "Execute result: $($executeResponse | ConvertTo-Json -Compress)" -ForegroundColor Cyan
}
catch {
    Write-Host "Error executing program: $_" -ForegroundColor Red
}
Write-Host

# 5. Get final state
Write-Host "5. Getting final state..." -ForegroundColor Yellow
try {
    $stateResponse = Invoke-RestMethod -Uri "$API_URL/state/$sessionId" -Method Get
    Write-Host "Final state:" -ForegroundColor Cyan
    Write-Host ($stateResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
}
catch {
    Write-Host "Error getting state: $_" -ForegroundColor Red
}
Write-Host

# 6. Get state report
Write-Host "6. Getting state report..." -ForegroundColor Yellow
try {
    $reportResponse = Invoke-RestMethod -Uri "$API_URL/report/$sessionId" -Method Get
    Write-Host "State report:" -ForegroundColor Cyan
    Write-Host $reportResponse.report -ForegroundColor White
}
catch {
    Write-Host "Error getting report: $_" -ForegroundColor Red
}

Write-Host
Write-Host "=== Test completed ===" -ForegroundColor Green 