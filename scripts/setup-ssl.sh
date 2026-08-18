#!/bin/bash
# ==============================================================================
# Ministry Cooperative Contributory Fund Management System
# Automated Let's Encrypt SSL / TLS 1.3 Certificate Setup Script
# ==============================================================================

set -e

DOMAIN="${1:-coop.ministry.gov.ng}"
EMAIL="${2:-admin@ministry.gov.ng}"

echo "========================================================================"
echo " Setting up Let's Encrypt TLS 1.3 SSL for Domain: $DOMAIN"
echo " Notification Email: $EMAIL"
echo "========================================================================"

# Check for Certbot
if ! command -v certbot >/dev/null 2>&1; then
  echo "📦 Installing Certbot and Nginx plugin..."
  sudo apt-get update
  sudo apt-get install -y certbot python3-certbot-nginx
fi

# Request Certificate
echo "🔐 Requesting SSL Certificate from Let's Encrypt..."
sudo certbot certonly --standalone \
  --preferred-challenges http \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN"

# Setup Auto-Renewal Cron Job
echo "⏰ Configuring automated certificate renewal cron job..."
CRON_JOB="0 3 * * * certbot renew --quiet --post-hook 'docker restart coop_fund_web'"
(crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "$CRON_JOB") | crontab -

echo "✅ SSL Certificate provisioned and auto-renewal scheduled daily at 03:00 WAT."
