#!/bin/bash
# MetaBuilder Database Backup Script
# Creates timestamped PostgreSQL backups with compression and retention
# Usage: ./backup-database.sh [--retention-days 30]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/metabuilder}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="metabuilder_backup_$TIMESTAMP.sql.gz"

# Database configuration from environment
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-metabuilder}"
DB_USER="${DATABASE_USER:-metabuilder}"
export PGPASSWORD="${DATABASE_PASSWORD:-changeme}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--retention-days 30]"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}=== MetaBuilder Database Backup ===${NC}"
echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "Backup directory: $BACKUP_DIR"
echo "Retention: $RETENTION_DAYS days"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
echo -e "${GREEN}Creating backup...${NC}"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --clean \
    --if-exists \
    --verbose \
    2>&1 | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Clean old backups
echo -e "${GREEN}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "metabuilder_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/metabuilder_backup_*.sql.gz | tail -10

echo ""
echo -e "${GREEN}=== Backup Complete ===${NC}"
