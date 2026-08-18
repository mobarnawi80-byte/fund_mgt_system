# ==============================================================================
# Ministry Cooperative Contributory Fund Management System
# Windows / PowerShell Production Cloud Deployment Script
# ==============================================================================

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " Starting Cooperative Fund Production Cloud Deployment Pipeline..." -ForegroundColor Cyan
Write-Host " Environment: Production" -ForegroundColor Cyan
Write-Host " Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Check Docker Prerequisites
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Error: Docker is not installed or not in PATH. Aborting."
    exit 1
}

# 2. Check .env file
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Write-Host "⚠️  No .env file found. Copying from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
    } else {
        Write-Error "❌ Error: .env or .env.example file missing."
        exit 1
    }
}

# 3. Pull latest Git updates
if (Test-Path .git) {
    Write-Host "📥 Pulling latest verified commits from origin main..." -ForegroundColor Green
    git pull origin main
}

# 4. Build and Start Multi-Container Infrastructure
Write-Host "🚀 Building production Docker images & launching services..." -ForegroundColor Green
docker compose down --remove-orphans
docker compose up -d --build

# 5. Wait for PostgreSQL Database Health Probe
Write-Host "⏳ Waiting for PostgreSQL database initialization..." -ForegroundColor Yellow
$retries = 15
$dbReady = $false

while ($retries -gt 0 -and -not $dbReady) {
    $check = docker exec coop_fund_postgres pg_isready -U coop_admin -d coop_fund_db 2>&1
    if ($check -match "accepting connections") {
        $dbReady = $true
        Write-Host "✅ Database connection healthy." -ForegroundColor Green
    } else {
        Write-Host "   Waiting for database to accept connections ($retries retries remaining)..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
        $retries--
    }
}

if (-not $dbReady) {
    Write-Error "❌ Database failed to start within timeout window."
    exit 1
}

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " 🎉 Production Deployment Successfully Completed!" -ForegroundColor Green
Write-Host " • Web Application:   http://localhost:80" -ForegroundColor White
Write-Host " • PostgreSQL DB:     localhost:5432 (coop_fund_db)" -ForegroundColor White
Write-Host " • Redis Cache:       localhost:6379" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Cyan
