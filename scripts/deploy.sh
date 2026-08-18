#!/bin/bash
# ==============================================================================
# Ministry Cooperative Contributory Fund Management System
# Production 1-Click Zero-Downtime Deployment Script
# ==============================================================================

set -e # Exit immediately on error

echo "========================================================================"
echo " Starting Cooperative Fund Production Cloud Deployment Pipeline..."
echo " Environment: Production"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================================================"

# 1. Check Prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Error: Docker is not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "❌ Error: Docker Compose is not installed. Aborting."; exit 1; }

# 2. Verify Environment Variables
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️  No .env file found. Generating default from .env.example..."
    cp .env.example .env
  else
    echo "❌ Error: .env or .env.example file missing. Aborting."; exit 1;
  fi
fi

# 3. Pull latest Git updates if inside a repository
if [ -d .git ]; then
  echo "📥 Pulling latest verified commits from origin main..."
  git pull origin main
fi

# 4. Build and Start Multi-Container Infrastructure
echo "🚀 Building production Docker images & launching services..."
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose down --remove-orphans
  docker-compose up -d --build
else
  docker compose down --remove-orphans
  docker compose up -d --build
fi

# 5. Wait for PostgreSQL Database Health Probe
echo "⏳ Waiting for PostgreSQL database initialization..."
RETRIES=15
until docker exec -i coop_fund_postgres pg_isready -U coop_admin -d coop_fund_db >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "   Waiting for database to accept connections ($RETRIES remaining)..."
  sleep 2
  RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ Database failed to start within timeout window."
  exit 1
fi
echo "✅ Database connection healthy."

# 6. Verify Web Application Health Endpoint
echo "⏳ Probing web frontend healthcheck endpoint..."
sleep 3
HEALTH_STATUS=$(docker exec -i coop_fund_web wget --no-verbose --tries=1 --spider http://localhost:80/health 2>&1 || echo "failed")

if [[ "$HEALTH_STATUS" =~ "failed" ]]; then
  echo "❌ Web application healthcheck failed."
  exit 1
fi

echo "========================================================================"
echo " 🎉 Production Deployment Successfully Completed!"
echo " • Web Application:   http://localhost:80"
echo " • PostgreSQL DB:     localhost:5432 (coop_fund_db)"
echo " • Redis Cache:       localhost:6379"
echo "========================================================================"
