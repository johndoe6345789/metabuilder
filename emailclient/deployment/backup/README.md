# Phase 8: Email Client Backup & Disaster Recovery

Comprehensive backup and disaster recovery solution for the MetaBuilder Email Client Phase 8 implementation with PostgreSQL, Redis, Postfix, and Dovecot support.

## Overview

This backup system provides:

- **Daily PostgreSQL dumps** with point-in-time recovery (PITR) support
- **Redis snapshot backups** with integrity verification
- **Postfix mail spool backups** for message queue preservation
- **Dovecot mail storage backups** for user mailbox data
- **Automatic encryption** at rest (AES-256-CBC)
- **30-day rolling retention** with automated cleanup
- **Zero-downtime restore** capability with rollback support
- **S3 integration** for off-site backup storage
- **Comprehensive logging** and health monitoring

## Quick Start

### Basic Backup

```bash
# Full backup with encryption
cd /path/to/emailclient
./deployment/backup/backup.sh --full

# Backup and upload to S3
S3_BUCKET=my-backups ./deployment/backup/backup.sh --full --upload

# List all available backups
./deployment/backup/backup.sh --list

# Verify backups
./deployment/backup/backup.sh --verify
```

### Basic Restore

```bash
# Restore from latest backup (interactive)
./deployment/backup/restore.sh --latest

# Restore from specific backup
./deployment/backup/restore.sh --backup-id 20260124_120000

# Dry run (see what would happen)
./deployment/backup/restore.sh --dry-run

# Verify backup without restoring
./deployment/backup/restore.sh --verify-only
```

## Directory Structure

```
deployment/backup/
├── backup.sh              # Main backup script
├── restore.sh             # Disaster recovery script
├── README.md              # This file
└── backups/              # Backup storage (created on first run)
    ├── postgresql/       # PostgreSQL dumps
    │   ├── dump_20260124_120000.sql.gz
    │   ├── dump_20260124_120000.custom
    │   └── postgresql_backups.txt
    ├── redis/           # Redis snapshots
    │   ├── dump_20260124_120000.rdb
    │   └── redis_backups.txt
    ├── postfix/         # Postfix mail spool
    │   ├── spool_20260124_120000.tar.gz
    │   └── postfix_backups.txt
    ├── dovecot/         # Dovecot mail storage
    │   ├── mail_20260124_120000.tar.gz
    │   └── dovecot_backups.txt
    ├── manifests/       # Backup metadata
    │   └── manifest_20260124_120000.json
    ├── logs/            # Backup and restore logs
    │   ├── backup_20260124_120000.log
    │   └── restore_20260124_120000.log
    ├── checkpoints/     # Restore rollback checkpoints
    └── exports/         # Exported backups for transfer
```

## Backup Strategy

### Full Backup (Recommended Daily)

```bash
./deployment/backup/backup.sh --full
```

**What's included:**
- PostgreSQL complete database dump (SQL + custom format)
- Redis complete snapshot
- Postfix mail spool and queue
- Dovecot all user mailboxes

**Typical size:** 500MB - 2GB depending on email volume

**Duration:** 2-5 minutes for typical deployments

**Frequency:** Daily (11 PM recommended for off-peak)

### Incremental Backup (PostgreSQL WAL only)

```bash
./deployment/backup/backup.sh --incremental
```

**What's included:**
- PostgreSQL WAL (Write-Ahead Logs) since last backup
- Enables point-in-time recovery to any moment

**Typical size:** 10-50MB per day

**Duration:** < 1 minute

**Frequency:** Hourly for production, ensures PITR recovery

### Compression & Encryption

**Compression:**
- Format: gzip
- Level: 6 (default, configurable)
- Reduces backup size by ~70%

**Encryption:**
- Algorithm: AES-256-CBC with salt
- Key derivation: SHA-256
- Requires `ENCRYPTION_KEY` environment variable

```bash
# Backup with custom encryption key
ENCRYPTION_KEY="my-secure-key-base64" ./deployment/backup/backup.sh --full
```

### Retention Policy

**Default retention:** 30 days rolling window

**Automatic cleanup:**
- Runs after each backup
- Deletes backups older than 30 days
- Prevents unbounded disk usage

**Customize retention:**

```bash
RETENTION_DAYS=60 ./deployment/backup/backup.sh --full
```

## Configuration

### Environment Variables

```bash
# Backup directory location
BACKUP_DIR=./backups

# S3 configuration for remote backups
S3_BUCKET=my-backup-bucket
AWS_REGION=us-east-1

# Encryption key (base64 encoded)
ENCRYPTION_KEY=<base64-encoded-key>

# Retention policy
RETENTION_DAYS=30

# Parallel jobs for faster backups
PARALLEL_JOBS=4

# Compression level (1-9)
COMPRESSION_LEVEL=6

# Debug output
DEBUG=1

# Dry run mode (no actual changes)
DRY_RUN=1
```

### Docker Compose Environment

The backup scripts read configuration from `.env` files:

```bash
# Development configuration
cp deployment/.env.example deployment/.env.local
```

**Required variables in `.env`:**

```env
# Database
DB_USER=emailclient
DB_PASSWORD=secure_password_here
DB_NAME=emailclient_db

# Redis
REDIS_PASSWORD=redis_password_here

# Encryption
ENCRYPTION_KEY=base64_encoded_encryption_key

# S3 (optional)
S3_BUCKET=my-backup-bucket
AWS_REGION=us-east-1
```

## Backup Manifest

Each backup creates a JSON manifest with metadata:

```json
{
  "backup_id": "2026-01-24_123456",
  "timestamp": "20260124_123456",
  "backup_date": "2026-01-24",
  "hostname": "emailclient.local",
  "backup_type": "full",
  "components": {
    "postgresql": {
      "enabled": true,
      "backup_file": "./backups/postgresql/dump_20260124_120000.sql.gz",
      "size": "345M"
    },
    "redis": {
      "enabled": true,
      "backup_file": "./backups/redis/dump_20260124_120000.rdb",
      "size": "52M"
    },
    "postfix": {
      "enabled": true,
      "backup_file": "./backups/postfix/spool_20260124_120000.tar.gz",
      "size": "123M"
    },
    "dovecot": {
      "enabled": true,
      "backup_file": "./backups/dovecot/mail_20260124_120000.tar.gz",
      "size": "456M"
    }
  },
  "encryption": {
    "enabled": true,
    "algorithm": "AES-256-CBC"
  },
  "retention": {
    "days": 30,
    "expires_at": "2026-02-23T12:34:56Z"
  },
  "total_size": "976M",
  "status": "completed",
  "version": "1.0"
}
```

## Disaster Recovery Procedures

### Scenario 1: Database Corruption

**Problem:** PostgreSQL database corruption detected

**Recovery steps:**

```bash
# 1. Verify latest backup
./deployment/backup/restore.sh --verify-only

# 2. Restore from backup (interactive confirmation)
./deployment/backup/restore.sh --latest

# 3. Verify service health
docker exec emailclient-postgres pg_isready -U emailclient

# 4. Confirm email service is operational
curl http://localhost:5000/health
```

**Expected downtime:** 2-5 minutes

### Scenario 2: Redis Cache Failure

**Problem:** Redis keys lost or corrupted

**Recovery steps:**

```bash
# 1. Restore Redis from backup
./deployment/backup/restore.sh --latest \
  --no-restore-postgresql \
  --no-restore-postfix \
  --no-restore-dovecot

# 2. Wait for Redis to fully load
sleep 10

# 3. Verify Redis is operational
docker exec emailclient-redis redis-cli DBSIZE
```

**Expected downtime:** 30 seconds (service pause during restore)

### Scenario 3: Complete System Failure

**Problem:** Entire email server crashed or hardware failed

**Recovery steps:**

```bash
# 1. On new server, deploy services
cd /path/to/emailclient
docker-compose -f deployment/docker-compose.yml up -d

# 2. Wait for services to be healthy
docker-compose -f deployment/docker-compose.yml ps

# 3. Restore all components from latest backup
./deployment/backup/restore.sh --latest

# 4. Verify all services
docker-compose -f deployment/docker-compose.yml ps
curl http://localhost:5000/health

# 5. Run smoke tests
./deployment/docker/email-service/startup-checks.sh
```

**Expected downtime:** 10-15 minutes for complete recovery

### Scenario 4: Point-in-Time Recovery

**Problem:** Need to recover data from specific moment in time

**Recovery steps:**

```bash
# 1. Find backup closest to desired time
./deployment/backup/backup.sh --list

# 2. Restore from specific backup
./deployment/backup/restore.sh \
  --backup-id 20260120_000000

# 3. Verify recovered data
docker exec emailclient-postgres psql -U emailclient -d emailclient_db -c \
  "SELECT MAX(created_at) FROM email_messages;"
```

**Expected downtime:** 5-10 minutes

## Advanced Features

### S3 Off-Site Backups

Store backups in Amazon S3 for geographic redundancy:

```bash
# Configure AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key

# Backup and upload to S3
S3_BUCKET=my-backups \
AWS_REGION=us-east-1 \
./deployment/backup/backup.sh --full --upload

# Verify S3 uploads
aws s3 ls s3://my-backups/backups/2026-01-24/
```

**S3 benefits:**
- Geographic redundancy
- Version protection
- Long-term archival
- Compliance requirements (GDPR, HIPAA)

**Estimated cost:** $0.023/GB/month for standard storage

### Backup Encryption Key Management

**Generate encryption key:**

```bash
# Generate 32-byte random key and base64 encode
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

# Add to .env file
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> deployment/.env.prod
```

**Store key securely:**

1. Use HashiCorp Vault for key management
2. AWS KMS for key encryption
3. Separate secure location (password manager)
4. Never commit to version control

**Key rotation:**

```bash
# Generate new key
NEW_KEY=$(openssl rand -base64 32)

# Re-encrypt all backups with new key
# (Manual process - decrypt with old key, encrypt with new key)
for backup in ./backups/postgresql/*.enc; do
    openssl enc -aes-256-cbc -d -in "$backup" -k "$OLD_KEY" | \
    openssl enc -aes-256-cbc -out "${backup%.enc}.new.enc" -k "$NEW_KEY"
done
```

### Selective Restore

Restore only specific components:

```bash
# PostgreSQL only
RESTORE_POSTGRESQL=1 \
RESTORE_REDIS=0 \
RESTORE_POSTFIX=0 \
RESTORE_DOVECOT=0 \
./deployment/backup/restore.sh --latest

# Redis and Postfix only
RESTORE_POSTGRESQL=0 \
RESTORE_REDIS=1 \
RESTORE_POSTFIX=1 \
RESTORE_DOVECOT=0 \
./deployment/backup/restore.sh --latest
```

### Backup Scheduling

**Cron job for daily backups:**

```bash
# Edit crontab
crontab -e

# Add daily backup at 11 PM
0 23 * * * cd /path/to/emailclient && \
  ENCRYPTION_KEY=$ENCRYPTION_KEY S3_BUCKET=$S3_BUCKET \
  ./deployment/backup/backup.sh --full --upload >> backups/logs/cron.log 2>&1

# Hourly incremental backups (PostgreSQL WAL)
0 * * * * cd /path/to/emailclient && \
  ./deployment/backup/backup.sh --incremental >> backups/logs/cron_incremental.log 2>&1
```

**systemd timer (recommended for modern systems):**

```ini
# /etc/systemd/system/emailclient-backup.service
[Unit]
Description=Email Client Daily Backup
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/emailclient
Environment="ENCRYPTION_KEY=..."
Environment="S3_BUCKET=..."
ExecStart=/path/to/emailclient/deployment/backup/backup.sh --full --upload
StandardOutput=journal
StandardError=journal
```

```ini
# /etc/systemd/system/emailclient-backup.timer
[Unit]
Description=Email Client Backup Timer
Requires=emailclient-backup.service

[Timer]
OnCalendar=daily
OnCalendar=23:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Health Checks & Monitoring

**Verify backup health:**

```bash
# Check last backup
LATEST_MANIFEST=$(ls -t backups/manifests/manifest_*.json | head -1)
jq '.components' "$LATEST_MANIFEST"

# Check backup sizes over time
for manifest in backups/manifests/manifest_*.json; do
    echo "$(basename "$manifest"): $(jq '.total_size' "$manifest")"
done

# Monitor backup disk usage
du -sh backups/
du -sh backups/*
```

**Alert on failed backups:**

```bash
#!/bin/bash
# Check if last backup succeeded

LATEST_MANIFEST=$(ls -t backups/manifests/manifest_*.json 2>/dev/null | head -1)
if [ -z "$LATEST_MANIFEST" ]; then
    echo "CRITICAL: No backup manifests found" | mail -s "Backup Alert" admin@example.com
    exit 1
fi

BACKUP_STATUS=$(jq -r '.status' "$LATEST_MANIFEST")
if [ "$BACKUP_STATUS" != "completed" ]; then
    echo "CRITICAL: Last backup status: $BACKUP_STATUS" | mail -s "Backup Alert" admin@example.com
    exit 1
fi

BACKUP_TIME=$(stat -f%m "$LATEST_MANIFEST" 2>/dev/null || stat -c%Y "$LATEST_MANIFEST")
CURRENT_TIME=$(date +%s)
HOURS_AGO=$(( (CURRENT_TIME - BACKUP_TIME) / 3600 ))

if [ $HOURS_AGO -gt 26 ]; then
    echo "WARNING: Last backup was $HOURS_AGO hours ago" | mail -s "Backup Alert" admin@example.com
    exit 1
fi

echo "OK: Backups are healthy"
exit 0
```

## Troubleshooting

### Common Issues

**Issue: "Docker container not running"**

```bash
# Check container status
docker ps | grep emailclient

# Start containers
docker-compose -f deployment/docker-compose.yml up -d

# Wait for health checks
sleep 30
```

**Issue: "Insufficient disk space"**

```bash
# Check available space
df -h backups/

# Clean old backups manually
find backups/postgresql -name "dump_*" -mtime +30 -delete
find backups/redis -name "dump_*" -mtime +30 -delete
```

**Issue: "Encryption key not set"**

```bash
# Generate and set encryption key
export ENCRYPTION_KEY=$(openssl rand -base64 32)
./deployment/backup/backup.sh --full
```

**Issue: "Restore fails with 'database already exists'"**

```bash
# Drop existing database
docker exec emailclient-postgres dropdb -U emailclient emailclient_db

# Retry restore
./deployment/backup/restore.sh --latest
```

**Issue: "Cannot decrypt backup file"**

```bash
# Verify encryption key is correct
echo $ENCRYPTION_KEY

# Try backup without decryption (if not encrypted)
ENCRYPTION_KEY="" ./deployment/backup/restore.sh --latest

# Or manually decrypt
openssl enc -aes-256-cbc -d -in backup.sql.gz.enc -k "$ENCRYPTION_KEY" | \
  gunzip > backup.sql
```

## Performance Tuning

**Optimize backup speed:**

```bash
# Increase parallel jobs
PARALLEL_JOBS=8 ./deployment/backup/backup.sh --full

# Reduce compression (faster, larger files)
COMPRESSION_LEVEL=1 ./deployment/backup/backup.sh --full

# Use faster storage
BACKUP_DIR=/fast-ssd/backups ./deployment/backup/backup.sh --full
```

**Optimize restore speed:**

```bash
# Parallel restore operations
# (Note: not yet implemented, planned for future)

# Selective component restore (faster)
RESTORE_POSTGRESQL=1 \
RESTORE_REDIS=0 \
RESTORE_POSTFIX=0 \
RESTORE_DOVECOT=0 \
./deployment/backup/restore.sh --latest
```

## Testing & Validation

**Test backup integrity:**

```bash
#!/bin/bash
# Test backup and restore cycle

set -e

echo "Starting backup integrity test..."

# Perform full backup
./deployment/backup/backup.sh --full

# Verify backup
./deployment/backup/backup.sh --verify

# List backups
./deployment/backup/backup.sh --list

# Dry run restore
./deployment/backup/restore.sh --dry-run

# Restore to test database (if separate instance available)
# RESTORE_BACKUP_ID=<id> ./deployment/backup/restore.sh

echo "Backup integrity test completed successfully"
```

**Monthly restore drill:**

```bash
# 1. Take full backup
./deployment/backup/backup.sh --full

# 2. Document backup ID
BACKUP_ID=$(ls -t backups/manifests/manifest_*.json | head -1 | sed 's/.*manifest_//' | sed 's/.json//')

# 3. Restore to separate test environment
RESTORE_BACKUP_ID=$BACKUP_ID ./deployment/backup/restore.sh

# 4. Verify data integrity
docker exec emailclient-postgres psql -U emailclient -d emailclient_db \
  -c "SELECT COUNT(*) FROM email_messages;"

# 5. Document results
echo "Restore drill completed at $(date)" >> backups/logs/restore_drills.log
```

## Compliance & Audit

**Backup audit trail:**

All backups are logged with:
- Backup ID and timestamp
- Backup component details (size, format, encryption)
- Manifest file (JSON metadata)
- Restore logs for all recoveries

**Compliance requirements:**

- **GDPR:** Annual retention review, secure deletion
- **HIPAA:** Encrypted backups, audit trail logging
- **SOC 2:** Automated backups, tested recovery procedures
- **ISO 27001:** Access controls, encryption at rest/transit

**Audit commands:**

```bash
# Find backups by date range
find backups/manifests -name "manifest_*" -newermt "2026-01-01" ! -newermt "2026-01-31"

# Generate backup audit report
for manifest in backups/manifests/manifest_*.json; do
    echo "$(basename "$manifest")"
    jq '{timestamp, backup_type, total_size, encryption}' "$manifest"
done > backups/logs/audit_report.txt

# Review restore audit trail
cat backups/logs/restore_*.log | grep "Restore\|completed\|FAILED"
```

## Support & Documentation

**Additional resources:**

- PostgreSQL Backup & Restore: https://www.postgresql.org/docs/current/backup.html
- Redis Persistence: https://redis.io/docs/management/persistence/
- Docker volumes & backup: https://docs.docker.com/storage/volumes/#backup-restore-or-migrate-a-volume

**Questions or issues?**

1. Check troubleshooting section above
2. Review backup/restore logs in `backups/logs/`
3. Check Docker container logs: `docker logs emailclient-postgres`
4. Review manifest files for backup details

---

**Last Updated:** 2026-01-24
**Phase:** 8 - Email Client Implementation
**Status:** Production Ready
