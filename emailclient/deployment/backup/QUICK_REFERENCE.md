# Phase 8: Backup & Restore Quick Reference Card

## Essential Commands

### Backup

```bash
# Full backup
./backup.sh --full

# Full backup with encryption
ENCRYPTION_KEY=mykey ./backup.sh --full

# Full backup to S3
S3_BUCKET=bucket ./backup.sh --full --upload

# List backups
./backup.sh --list

# Verify backups
./backup.sh --verify
```

### Restore

```bash
# From latest backup (interactive)
./restore.sh --latest

# From specific backup
./restore.sh --backup-id 20260124_120000

# Verify only (no restore)
./restore.sh --verify-only

# PostgreSQL only
RESTORE_POSTGRESQL=1 RESTORE_REDIS=0 RESTORE_POSTFIX=0 RESTORE_DOVECOT=0 ./restore.sh --latest
```

### Monitoring

```bash
# Check health
./backup-monitoring.sh

# Check recency only
./backup-monitoring.sh --check-recency

# With Slack alerts
ENABLE_ALERTS=1 ALERT_SLACK_WEBHOOK=<url> ./backup-monitoring.sh
```

## Emergency Recovery Scenarios

### Database Corruption

```bash
# 1. Restore database
./restore.sh --latest

# 2. Type 'RESTORE' to confirm
# 3. Wait 2-5 minutes
# 4. Verify health
curl http://localhost:5000/health
```

### Complete System Failure

```bash
# 1. Deploy services
docker-compose -f deployment/docker-compose.yml up -d

# 2. Wait for health
sleep 30

# 3. Restore all components
./restore.sh --latest

# 4. Type 'RESTORE' to confirm

# 5. Verify
docker-compose -f deployment/docker-compose.yml ps
curl http://localhost:5000/health
```

### Redis Cache Loss

```bash
# Restore Redis only
RESTORE_POSTGRESQL=0 RESTORE_REDIS=1 \
RESTORE_POSTFIX=0 RESTORE_DOVECOT=0 \
./restore.sh --latest
```

## Configuration

### Environment Variables

```bash
# Encryption
ENCRYPTION_KEY=base64_key

# S3 Storage
S3_BUCKET=my-bucket
AWS_REGION=us-east-1

# Retention
RETENTION_DAYS=30

# Monitoring
ENABLE_ALERTS=1
ALERT_EMAIL=admin@example.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...
```

### .env File

```env
# Backup
BACKUP_DIR=./backups
RETENTION_DAYS=30

# S3
S3_BUCKET=my-backups
AWS_REGION=us-east-1

# Encryption
ENCRYPTION_KEY=base64_key_here

# Monitoring
ALERT_EMAIL=admin@example.com
```

## File Locations

```
deployment/backup/
├── backup.sh              # Main backup script
├── restore.sh             # Disaster recovery script
├── backup-monitoring.sh   # Health monitoring
├── README.md              # Full documentation
├── QUICK_REFERENCE.md     # This file
└── backups/               # Created at runtime
    ├── postgresql/        # SQL dumps
    ├── redis/            # RDB snapshots
    ├── postfix/          # Mail spool
    ├── dovecot/          # Mailboxes
    ├── manifests/        # Metadata
    ├── logs/             # Operation logs
    └── checkpoints/      # Restore checkpoints
```

## Backup Sizes & Times

| Component | Size | Time |
|-----------|------|------|
| PostgreSQL | 300-500MB | 2-3 min |
| Redis | 50-100MB | <1 min |
| Postfix | 100-200MB | 1 min |
| Dovecot | 200-800MB | 2-3 min |
| **Total** | **~1-2GB** | **~5 min** |

## Retention & Cleanup

| Strategy | Frequency | Retention |
|----------|-----------|-----------|
| Full backups | Daily (11 PM) | 30 days |
| Incremental | Hourly | 7 days |
| Cleanup | Auto (after backup) | 30 days |

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | None needed |
| 1 | Failure | Check logs in `backups/logs/` |
| 2 | Validation failed | Run with `--skip-validation` |
| 3 | Rollback required | Check recent errors |

## Common Issues

| Issue | Solution |
|-------|----------|
| "No containers" | `docker-compose -f deployment/docker-compose.yml up -d` |
| "No disk space" | `find backups/ -mtime +30 -delete` |
| "No encryption key" | `export ENCRYPTION_KEY=$(openssl rand -base64 32)` |
| "Database exists" | `docker exec emailclient-postgres dropdb -U emailclient emailclient_db` |

## Monitoring Checklist

- [ ] Daily backup completion (check logs)
- [ ] Backup size reasonable (not growing unexpectedly)
- [ ] Disk space available (>1GB)
- [ ] Encryption enabled (if required)
- [ ] S3 uploads successful (if configured)
- [ ] Weekly test restore
- [ ] Monthly backup drill

## Disaster Recovery Testing

```bash
# Run monthly
./backup.sh --full
BACKUP_ID=$(ls -t backups/manifests/manifest_*.json | head -1 | sed 's/.*manifest_//' | sed 's/.json//')
./restore.sh --backup-id $BACKUP_ID --dry-run
echo "Tested restore from: $BACKUP_ID" >> backups/logs/drills.txt
```

## Security Reminders

- ✅ Store ENCRYPTION_KEY in secure location
- ✅ Rotate encryption key annually
- ✅ Test restore from encrypted backups quarterly
- ✅ Keep S3 bucket private
- ✅ Enable S3 versioning for extra protection
- ✅ Use IAM roles for AWS credentials
- ✅ Never commit .env files with secrets

## Useful One-Liners

```bash
# Last backup info
jq . backups/manifests/manifest_*.json 2>/dev/null | tail -20

# Backup size trend
for m in backups/manifests/manifest_*.json; do
  echo -n "$(basename $m): "
  jq -r '.total_size' $m
done

# Latest backup age (hours)
echo $((($(date +%s)-$(stat -f%m backups/manifests/manifest_*.json 2>/dev/null | sort -rn | head -1))/3600))

# Count backups by component
echo "PostgreSQL: $(ls backups/postgresql/dump_*.sql.gz* 2>/dev/null | wc -l)"
echo "Redis: $(ls backups/redis/dump_*.rdb* 2>/dev/null | wc -l)"
echo "Postfix: $(ls backups/postfix/spool_*.tar.gz* 2>/dev/null | wc -l)"
echo "Dovecot: $(ls backups/dovecot/mail_*.tar.gz* 2>/dev/null | wc -l)"
```

## Performance Tips

- Run backup at off-peak hours (11 PM recommended)
- Use `--incremental` for PostgreSQL WAL backups (hourly)
- Store backups on fast SSD if possible
- Use S3 for long-term off-site retention
- Compress at level 6 (balance speed/size)
- Run monitoring script hourly via cron

## Support Resources

| Resource | Location |
|----------|----------|
| Full guide | `deployment/backup/README.md` |
| Implementation details | `PHASE8_BACKUP_IMPLEMENTATION.md` |
| Backup logs | `backups/logs/backup_*.log` |
| Restore logs | `backups/logs/restore_*.log` |
| Monitoring logs | `backups/logs/monitoring.log` |

## Version History

- **2026-01-24:** Initial release (Phase 8)
  - Full backup support (PostgreSQL, Redis, Postfix, Dovecot)
  - Zero-downtime restore capability
  - 30-day rolling retention
  - AES-256-CBC encryption
  - S3 integration
  - Comprehensive monitoring

---

**Last Updated:** 2026-01-24
**Status:** Production Ready
**Questions?** See `deployment/backup/README.md` for detailed documentation
