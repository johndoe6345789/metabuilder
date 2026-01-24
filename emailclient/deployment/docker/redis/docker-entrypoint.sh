#!/bin/bash
set -e

# Phase 8: Redis Docker Entrypoint Script
# Email Client Implementation - Container initialization

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to wait for Redis to be ready
wait_for_redis() {
    local max_attempts=30
    local attempt=1

    log "Waiting for Redis to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if redis-cli ping > /dev/null 2>&1; then
            log "Redis is ready!"
            return 0
        fi

        log "Attempt $attempt/$max_attempts: Redis not ready yet, retrying in 1 second..."
        sleep 1
        attempt=$((attempt + 1))
    done

    log "ERROR: Redis did not become ready after $max_attempts attempts"
    return 1
}

# Function to initialize Redis configuration from environment
initialize_redis_config() {
    local conf_file="/usr/local/etc/redis/redis.conf"

    log "Initializing Redis configuration..."

    # Set password from environment variable if provided
    if [ -n "$REDIS_PASSWORD" ]; then
        log "Setting Redis password from REDIS_PASSWORD environment variable"
        # Use sed to update the requirepass directive
        sed -i "s/requirepass .*/requirepass $REDIS_PASSWORD/" "$conf_file"
    fi

    # Set memory limit from environment variable if provided
    if [ -n "$REDIS_MAXMEMORY" ]; then
        log "Setting Redis max memory to $REDIS_MAXMEMORY"
        sed -i "s/maxmemory .*/maxmemory $REDIS_MAXMEMORY/" "$conf_file"
    fi

    # Set eviction policy from environment variable if provided
    if [ -n "$REDIS_MAXMEMORY_POLICY" ]; then
        log "Setting Redis eviction policy to $REDIS_MAXMEMORY_POLICY"
        sed -i "s/maxmemory-policy .*/maxmemory-policy $REDIS_MAXMEMORY_POLICY/" "$conf_file"
    fi

    # Ensure data directory exists and has correct permissions
    if [ ! -d "/data" ]; then
        log "Creating /data directory"
        mkdir -p /data
    fi

    log "Redis configuration initialized"
}

# Function to run Redis initialization tasks
run_redis_initialization() {
    log "Starting Redis initialization..."

    # Wait for Redis to start
    wait_for_redis || exit 1

    # Ping Redis to verify connectivity
    if redis-cli ping; then
        log "Redis ping successful"
    else
        log "ERROR: Redis ping failed"
        return 1
    fi

    # Get Redis info
    log "Redis server info:"
    redis-cli info server | head -5

    # Verify persistence is enabled
    log "Redis persistence config:"
    redis-cli config get "appendonly"
    redis-cli config get "save"

    log "Redis initialization completed"
}

# Function to monitor Redis in background
monitor_redis() {
    while true; do
        if ! redis-cli ping > /dev/null 2>&1; then
            log "ERROR: Redis health check failed"
            # Don't exit, let Docker health check handle it
        fi
        sleep 30
    done
}

# Main entrypoint
log "==============================================="
log "Phase 8: Redis Container Entrypoint"
log "==============================================="

log "Redis version:"
redis-server --version

log "Starting Redis initialization..."
initialize_redis_config

log "Starting Redis server..."
log "Configuration file: /usr/local/etc/redis/redis.conf"

# Start background monitoring
monitor_redis &

# Execute Redis server with config
exec "$@"
