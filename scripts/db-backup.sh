#!/bin/bash
# ==============================================================================
# Ministry Cooperative Contributory Fund Management System
# Automated Encrypted Database Backup & Disaster Recovery Script
# Target RPO: <= 15 minutes | Target RTO: <= 1 hour
# ==============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
BACKUP_FILE="${BACKUP_DIR}/coop_db_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

mkdir -p "$BACKUP_DIR"

echo "------------------------------------------------------------------------"
echo " Starting Automated Encrypted Database Backup..."
echo " Target File: ${BACKUP_FILE}"
echo "------------------------------------------------------------------------"

# 1. Generate pg_dump compressed with gzip
docker exec -t coop_fund_postgres pg_dump -U coop_admin -d coop_fund_db --clean --if-exists | gzip > "$BACKUP_FILE"

# 2. Compute SHA256 Checksum for Audit Integrity
sha256sum "$BACKUP_FILE" > "${BACKUP_FILE}.sha256"

# 3. Encrypt backup with AES-256-CBC
OPENSSL_KEY="${ENCRYPTION_MASTER_KEY:-CoopMasterKeyAES256Backup2026!}"
openssl enc -aes-256-cbc -salt -pbkdf2 -in "$BACKUP_FILE" -out "$ENCRYPTED_FILE" -k "$OPENSSL_KEY"

# 4. Remove unencrypted raw dump file
rm -f "$BACKUP_FILE"

echo "✅ Backup Completed & Encrypted Successfully!"
echo "   Encrypted Archive: ${ENCRYPTED_FILE}"
echo "   SHA256 Hash:       $(cat "${BACKUP_FILE}.sha256" | awk '{print $1}')"

# 5. Clean up backups older than 30 days (Statutory Data Retention Policy)
find "$BACKUP_DIR" -type f -name "coop_db_*.enc" -mtime +30 -exec rm {} \;
find "$BACKUP_DIR" -type f -name "coop_db_*.sha256" -mtime +30 -exec rm {} \;
echo "🧹 Old backups (>30 days) purged according to statutory retention policy."
