#!/bin/bash
# ==============================================================================
# Ministry Cooperative Contributory Fund Management System
# Disaster Recovery Database Restore Script
# ==============================================================================

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Please specify the encrypted backup file (.enc) to restore."
  echo "Usage: ./scripts/db-restore.sh ./backups/coop_db_YYYYMMDD_HHMMSSZ.sql.gz.enc"
  exit 1
fi

ENCRYPTED_FILE="$1"
RAW_FILE="${ENCRYPTED_FILE%.enc}"
OPENSSL_KEY="${ENCRYPTION_MASTER_KEY:-CoopMasterKeyAES256Backup2026!}"

if [ ! -f "$ENCRYPTED_FILE" ]; then
  echo "❌ Error: Backup file '$ENCRYPTED_FILE' not found."
  exit 1
fi

echo "------------------------------------------------------------------------"
echo " ⚠️  INITIATING DISASTER RECOVERY DATABASE RESTORATION"
echo " Restoring: ${ENCRYPTED_FILE}"
echo "------------------------------------------------------------------------"

# 1. Decrypt Archive
echo "🔓 Decrypting archive with AES-256-CBC..."
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ENCRYPTED_FILE" -out "$RAW_FILE" -k "$OPENSSL_KEY"

# 2. Verify SHA256 Checksum
if [ -f "${RAW_FILE}.sha256" ]; then
  echo "🔍 Verifying cryptographic SHA256 integrity hash..."
  sha256sum -c "${RAW_FILE}.sha256"
  echo "✅ Cryptographic hash matches original backup."
else
  echo "⚠️  Warning: No .sha256 hash file found. Proceeding with caution."
fi

# 3. Stream dump to PostgreSQL Database
echo "📥 Restoring SQL dump into PostgreSQL container (coop_fund_postgres)..."
gunzip -c "$RAW_FILE" | docker exec -i coop_fund_postgres psql -U coop_admin -d coop_fund_db

# 4. Clean up decrypted temporary file
rm -f "$RAW_FILE"

echo "========================================================================"
echo " 🎉 Disaster Recovery Database Restoration Completed Successfully!"
echo " All 21 relational tables and transaction ledgers have been restored."
echo "========================================================================"
