#!/bin/bash
# Phase 8: Email Client System Backup Script
# Full backup of database, attachments, and critical data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${1:-.}/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="emailclient-backup-$TIMESTAMP"

echo "Email Client Backup - $TIMESTAMP"
echo "=================================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Database Backup
echo "[1/4] Backing up PostgreSQL database..."
DB_FILE="$BACKUP_DIR/$BACKUP_NAME-database.sql"
docker compose -f "$SCRIPT_DIR/docker-compose.yml" exec -T postgres \
  pg_dump -U emailclient emailclient > "$DB_FILE"
echo "✓ Database backup: $DB_FILE ($(du -h "$DB_FILE" | cut -f1))"

# 2. Redis Backup
echo "[2/4] Backing up Redis cache..."
REDIS_FILE="$BACKUP_DIR/$BACKUP_NAME-redis.rdb"
docker compose -f "$SCRIPT_DIR/docker-compose.yml" exec -T redis \
  redis-cli BGSAVE >/dev/null 2>&1
docker cp emailclient-redis:/data/dump.rdb "$REDIS_FILE" 2>/dev/null || echo "  (Redis backup skipped or empty)"
if [ -f "$REDIS_FILE" ]; then
  echo "✓ Redis backup: $REDIS_FILE ($(du -h "$REDIS_FILE" | cut -f1))"
else
  echo "✓ Redis backup skipped (no data)"
fi

# 3. Attachment Files Backup
echo "[3/4] Backing up email attachments..."
ATTACH_FILE="$BACKUP_DIR/$BACKUP_NAME-attachments.tar.gz"
docker cp emailclient-email-service:/data/attachments "$BACKUP_DIR/attachments-temp" 2>/dev/null || true
if [ -d "$BACKUP_DIR/attachments-temp" ]; then
  tar -czf "$ATTACH_FILE" -C "$BACKUP_DIR" attachments-temp 2>/dev/null || true
  rm -rf "$BACKUP_DIR/attachments-temp"
  if [ -f "$ATTACH_FILE" ]; then
    echo "✓ Attachments backup: $ATTACH_FILE ($(du -h "$ATTACH_FILE" | cut -f1))"
  fi
else
  echo "✓ Attachments backup skipped (empty)"
fi

# 4. Dovecot Mailbox Backup
echo "[4/4] Backing up Dovecot mailboxes..."
MAIL_FILE="$BACKUP_DIR/$BACKUP_NAME-mailboxes.tar.gz"
docker cp emailclient-dovecot:/var/mail "$BACKUP_DIR/mail-temp" 2>/dev/null || true
if [ -d "$BACKUP_DIR/mail-temp" ] && [ -n "$(ls -A "$BACKUP_DIR/mail-temp")" ]; then
  tar -czf "$MAIL_FILE" -C "$BACKUP_DIR" mail-temp 2>/dev/null || true
  rm -rf "$BACKUP_DIR/mail-temp"
  if [ -f "$MAIL_FILE" ]; then
    echo "✓ Mailboxes backup: $MAIL_FILE ($(du -h "$MAIL_FILE" | cut -f1))"
  fi
else
  echo "✓ Mailboxes backup skipped (empty)"
fi

# Create manifest
echo ""
echo "[5/5] Creating backup manifest..."
MANIFEST="$BACKUP_DIR/$BACKUP_NAME-manifest.txt"
cat > "$MANIFEST" << EOF
Email Client Backup Manifest
=============================
Timestamp: $TIMESTAMP
Hostname: $(hostname)
Docker Compose: $SCRIPT_DIR/docker-compose.yml

Files:
------
EOF

for file in "$BACKUP_DIR/$BACKUP_NAME"*; do
  if [ -f "$file" ]; then
    SIZE=$(du -h "$file" | cut -f1)
    NAME=$(basename "$file")
    echo "$NAME ($SIZE)" >> "$MANIFEST"
  fi
done

TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | grep "backups" | cut -f1)
echo "
Total backup size: $TOTAL_SIZE

Restore Instructions:
---------------------
# Restore database
docker compose exec -T postgres psql -U emailclient emailclient < $BACKUP_NAME-database.sql

# Restore redis
docker cp $BACKUP_NAME-redis.rdb emailclient-redis:/data/dump.rdb
docker compose restart redis

# Restore attachments
tar -xzf $BACKUP_NAME-attachments.tar.gz
docker cp attachments-temp/attachments emailclient-email-service:/data/

# Restore mailboxes
tar -xzf $BACKUP_NAME-mailboxes.tar.gz
docker cp mail-temp/mail emailclient-dovecot:/var/
" >> "$MANIFEST"

echo "✓ Manifest created: $MANIFEST"

echo ""
echo "Backup Complete!"
echo "================"
echo "Total size: $TOTAL_SIZE"
echo "Location: $BACKUP_DIR"
echo ""
echo "Retention policy: Keep latest 7 backups"
echo "Cleanup old backups:"
echo "  ls -t $BACKUP_DIR/*-manifest.txt | tail -n +8 | xargs -I {} rm {}.."
