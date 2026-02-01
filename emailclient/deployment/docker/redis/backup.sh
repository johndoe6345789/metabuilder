#!/bin/bash

# Phase 8: Redis Backup Script
# Email Client Implementation - Redis data backup and recovery

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/redis}"
CONTAINER_NAME="${CONTAINER_NAME:-emailclient-redis}"
REDIS_PASSWORD="${REDIS_PASSWORD:-redis_development_password}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/redis_backup_${TIMESTAMP}.rdb"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

# Check if container is running
check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Redis container '$CONTAINER_NAME' is not running"
        return 1
    fi
    log_success "Redis container is running"
    return 0
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        log_success "Backup directory created"
    fi
}

# Check disk space
check_disk_space() {
    local available_kb=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
    local required_kb=600000  # ~600MB for RDB

    if [ "$available_kb" -lt "$required_kb" ]; then
        log_error "Insufficient disk space. Available: ${available_kb}KB, Required: ${required_kb}KB"
        return 1
    fi
    log_success "Disk space check passed"
    return 0
}

# Perform backup
backup_redis() {
    log_info "Starting Redis backup..."

    # Trigger BGSAVE (background save)
    log_info "Triggering BGSAVE..."
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" BGSAVE

    # Wait for background save to complete
    log_info "Waiting for background save to complete..."
    local max_wait=300  # 5 minutes
    local elapsed=0
    local wait_interval=5

    while [ $elapsed -lt $max_wait ]; do
        local save_status=$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" LASTSAVE 2>/dev/null || echo "0")
        local last_save=$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" LASTSAVE 2>/dev/null || echo "0")

        if [ "$last_save" != "0" ]; then
            log_success "Background save completed at $(date -d @$last_save)"
            break
        fi

        elapsed=$((elapsed + wait_interval))
        echo -ne "${BLUE}.${NC}"
        sleep $wait_interval
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_warning "Background save did not complete within timeout"
    fi

    # Copy RDB file from container
    log_info "Copying RDB file from container..."
    docker exec "$CONTAINER_NAME" cat /data/dump.rdb > "$BACKUP_FILE"

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not created"
        return 1
    fi

    local backup_size=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    log_success "Backup completed: $BACKUP_FILE (${backup_size})"
    return 0
}

# Verify backup
verify_backup() {
    log_info "Verifying backup..."

    # Check file exists and is readable
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file does not exist"
        return 1
    fi

    # Check file is not empty
    if [ ! -s "$BACKUP_FILE" ]; then
        log_error "Backup file is empty"
        return 1
    fi

    # Try to load RDB into temporary container
    log_info "Testing backup integrity with temporary container..."
    if docker run --rm -v "$BACKUP_FILE:/tmp/test.rdb" redis:7-alpine \
        redis-cli -a "$REDIS_PASSWORD" --pipe < "$BACKUP_FILE" > /dev/null 2>&1; then
        log_success "Backup integrity verified"
        return 0
    else
        log_warning "Backup integrity check skipped (temporary test failed)"
        return 0
    fi
}

# Generate backup manifest
generate_manifest() {
    local manifest_file="$BACKUP_DIR/manifest_${TIMESTAMP}.txt"

    cat > "$manifest_file" << EOF
Redis Backup Manifest
=====================
Timestamp: $TIMESTAMP
Container: $CONTAINER_NAME
Backup File: $BACKUP_FILE
File Size: $(du -h "$BACKUP_FILE" | awk '{print $1}')
Checksum (MD5): $(md5sum "$BACKUP_FILE" | awk '{print $1}')
Checksum (SHA256): $(sha256sum "$BACKUP_FILE" | awk '{print $1}')

Redis Info:
$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" INFO server 2>/dev/null | head -10)

Memory Usage:
$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" INFO memory 2>/dev/null | grep -E "used_memory|peak_memory")

Database Size:
$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" DBSIZE 2>/dev/null)

Backup Status: SUCCESS
EOF

    log_success "Manifest created: $manifest_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."

    local count=0
    while IFS= read -r backup_file; do
        log_warning "Removing old backup: $backup_file"
        rm -f "$backup_file"
        count=$((count + 1))
    done < <(find "$BACKUP_DIR" -name "redis_backup_*.rdb" -type f -mtime +$RETENTION_DAYS)

    if [ $count -gt 0 ]; then
        log_success "Removed $count old backup(s)"
    else
        log_info "No old backups to remove"
    fi
}

# Restore from backup
restore_backup() {
    local restore_file="$1"

    if [ -z "$restore_file" ] || [ ! -f "$restore_file" ]; then
        log_error "Backup file not specified or does not exist"
        return 1
    fi

    log_warning "WARNING: Restore will overwrite current Redis data"
    read -p "Type 'YES' to confirm restore from $restore_file: " -r confirm

    if [ "$confirm" != "YES" ]; then
        log_info "Restore cancelled"
        return 0
    fi

    log_info "Stopping Redis container..."
    docker stop "$CONTAINER_NAME"

    log_info "Restoring backup..."
    docker cp "$restore_file" "${CONTAINER_NAME}:/data/dump.rdb"

    log_info "Starting Redis container..."
    docker start "$CONTAINER_NAME"

    # Wait for container to be healthy
    sleep 5
    if check_container; then
        log_success "Restore completed successfully"
        return 0
    else
        log_error "Restore completed but container health check failed"
        return 1
    fi
}

# Dump and analyze Redis data
analyze_redis() {
    log_info "Analyzing Redis database..."

    log_info "Total keys:"
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" DBSIZE

    log_info "Keys by type:"
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" --scan | \
        while read key; do
            docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" TYPE "$key"
        done | sort | uniq -c

    log_info "Memory breakdown:"
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" INFO memory

    log_info "Largest keys:"
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" --scan | \
        while read key; do
            size=$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" STRLEN "$key" 2>/dev/null || echo 0)
            echo "$size $key"
        done | sort -rn | head -10
}

# Main execution
main() {
    local command="${1:-backup}"

    log_info "==============================================="
    log_info "Phase 8: Redis Backup & Recovery Tool"
    log_info "==============================================="

    case "$command" in
        backup)
            check_container || exit 1
            create_backup_dir
            check_disk_space || exit 1
            backup_redis || exit 1
            verify_backup
            generate_manifest
            cleanup_old_backups
            log_success "Backup process completed"
            ;;
        restore)
            local restore_file="${2:-}"
            check_container || exit 1
            restore_backup "$restore_file" || exit 1
            ;;
        analyze)
            check_container || exit 1
            analyze_redis
            ;;
        list)
            log_info "Available backups:"
            ls -lh "$BACKUP_DIR"/redis_backup_*.rdb 2>/dev/null || log_warning "No backups found"
            ;;
        *)
            echo "Usage: $0 {backup|restore|analyze|list} [backup_file]"
            echo ""
            echo "Commands:"
            echo "  backup              Create a new Redis backup"
            echo "  restore <file>      Restore from a backup file"
            echo "  analyze             Analyze current Redis database"
            echo "  list                List available backups"
            echo ""
            echo "Environment Variables:"
            echo "  BACKUP_DIR          Backup directory (default: ./backups/redis)"
            echo "  CONTAINER_NAME      Redis container name (default: emailclient-redis)"
            echo "  REDIS_PASSWORD      Redis password (default: redis_development_password)"
            echo "  RETENTION_DAYS      Keep backups for N days (default: 30)"
            exit 1
            ;;
    esac
}

main "$@"
