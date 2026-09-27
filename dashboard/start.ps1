# SecureBank Dashboard — Start Script
#
# Usage:  .\dashboard\start.ps1
# Starts both the backend API (port 5050) and the Vite frontend (port 5173).

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $root

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " SecureBank Autonomous DevSecOps Dashboard" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting backend API on  http://localhost:5050"
Write-Host "Starting frontend on     http://localhost:5173"
Write-Host ""

# Start backend in background
$backendLog = Join-Path $root "backend.log"
$backend = Start-Process python -ArgumentList (Join-Path $root "server.py") `
    -WorkingDirectory $repoRoot `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendLog `
    -PassThru -WindowStyle Hidden

Write-Host "Backend PID: $($backend.Id)  (log: $backendLog)" -ForegroundColor Green

# Start frontend
Set-Location $root
npm run dev
