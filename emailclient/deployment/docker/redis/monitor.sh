#!/bin/bash

# Phase 8: Redis Monitoring Script
# Email Client Implementation - Redis health and performance monitoring

set -e

# Configuration
CONTAINER_NAME="${CONTAINER_NAME:-emailclient-redis}"
REDIS_PASSWORD="${REDIS_PASSWORD:-redis_development_password}"
REFRESH_INTERVAL="${REFRESH_INTERVAL:-5}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Thresholds
MEMORY_WARNING_PCT=80
MEMORY_CRITICAL_PCT=95
CONNECTED_CLIENTS_WARNING=1000
EVICTION_WARNING=100

# Helper functions
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

log_metric() {
    echo -e "${CYAN}$1${NC}"
}

# Check container status
check_container_status() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Redis container '$CONTAINER_NAME' is not running"
        return 1
    fi
    return 0
}

# Get Redis info
get_redis_info() {
    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" INFO "$1" 2>/dev/null || echo ""
}

# Parse Redis info field
parse_info() {
    local info="$1"
    local field="$2"
    echo "$info" | grep "^$field:" | cut -d: -f2 | tr -d '\r'
}

# Format bytes to human readable
format_bytes() {
    local bytes=$1
    if [ "$bytes" -lt 1024 ]; then
        echo "${bytes}B"
    elif [ "$bytes" -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    elif [ "$bytes" -lt 1073741824 ]; then
        echo "$((bytes / 1048576))MB"
    else
        echo "$((bytes / 1073741824))GB"
    fi
}

# Display health check
health_check() {
    log_info "==============================================="
    log_info "Redis Health Check"
    log_info "==============================================="

    if ! check_container_status; then
        return 1
    fi

    # Ping test
    if docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" PING > /dev/null 2>&1; then
        log_success "Redis PING successful"
    else
        log_error "Redis PING failed"
        return 1
    fi

    # Get server info
    local server_info=$(get_redis_info "server")
    local redis_version=$(parse_info "$server_info" "redis_version")
    local uptime=$(parse_info "$server_info" "uptime_in_seconds")

    log_metric "Redis Version: $redis_version"
    log_metric "Uptime: ${uptime}s ($(date -u -d @${uptime} +%H:%M:%S))"

    # Get memory info
    local memory_info=$(get_redis_info "memory")
    local used_memory=$(parse_info "$memory_info" "used_memory")
    local max_memory=$(parse_info "$memory_info" "maxmemory")
    local used_memory_human=$(parse_info "$memory_info" "used_memory_human")
    local maxmemory_human=$(parse_info "$memory_info" "maxmemory_human")

    local memory_pct=0
    if [ ! -z "$max_memory" ] && [ "$max_memory" -gt 0 ]; then
        memory_pct=$((used_memory * 100 / max_memory))
    fi

    log_metric "Memory Usage: $used_memory_human / $maxmemory_human ($memory_pct%)"

    # Memory warning
    if [ "$memory_pct" -ge "$MEMORY_CRITICAL_PCT" ]; then
        log_error "CRITICAL: Memory usage at $memory_pct%"
    elif [ "$memory_pct" -ge "$MEMORY_WARNING_PCT" ]; then
        log_warning "WARNING: Memory usage at $memory_pct%"
    else
        log_success "Memory usage normal"
    fi

    # Get stats info
    local stats_info=$(get_redis_info "stats")
    local total_commands=$(parse_info "$stats_info" "total_commands_processed")
    local evicted_keys=$(parse_info "$stats_info" "evicted_keys")
    local rejected_connections=$(parse_info "$stats_info" "rejected_connections")

    log_metric "Total Commands: $total_commands"
    log_metric "Evicted Keys: $evicted_keys"
    log_metric "Rejected Connections: $rejected_connections"

    if [ ! -z "$evicted_keys" ] && [ "$evicted_keys" -gt "$EVICTION_WARNING" ]; then
        log_warning "WARNING: High number of evicted keys ($evicted_keys)"
    fi

    # Get clients info
    local clients_info=$(get_redis_info "clients")
    local connected_clients=$(parse_info "$clients_info" "connected_clients")
    local blocked_clients=$(parse_info "$clients_info" "blocked_clients")

    log_metric "Connected Clients: $connected_clients"
    log_metric "Blocked Clients: $blocked_clients"

    if [ ! -z "$connected_clients" ] && [ "$connected_clients" -gt "$CONNECTED_CLIENTS_WARNING" ]; then
        log_warning "WARNING: High number of connected clients ($connected_clients)"
    fi

    # Get persistence info
    local persistence_info=$(get_redis_info "persistence")
    local rdb_changes=$(parse_info "$persistence_info" "rdb_changes_since_last_save")
    local rdb_last_save=$(parse_info "$persistence_info" "rdb_last_save_time")
    local aof_enabled=$(parse_info "$persistence_info" "aof_enabled")
    local aof_last_bgrewrite=$(parse_info "$persistence_info" "aof_last_bgrewrite_time")

    log_metric "RDB Changes Since Save: $rdb_changes"
    log_metric "RDB Last Save: $(date -d @${rdb_last_save} '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'N/A')"
    log_metric "AOF Enabled: $aof_enabled"
    log_metric "AOF Last Rewrite: $(date -d @${aof_last_bgrewrite} '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'N/A')"

    # Get replication info
    local replication_info=$(get_redis_info "replication")
    local role=$(parse_info "$replication_info" "role")
    log_metric "Role: $role"

    return 0
}

# Display continuous monitoring
monitor_continuous() {
    local iteration=0

    while true; do
        clear
        iteration=$((iteration + 1))

        log_info "==============================================="
        log_info "Redis Monitoring (Iteration $iteration)"
        log_info "==============================================="
        log_info "Last updated: $(date +'%Y-%m-%d %H:%M:%S')"

        if ! check_container_status; then
            log_error "Container not running, will retry in ${CHECK_INTERVAL}s"
            sleep "$CHECK_INTERVAL"
            continue
        fi

        # Memory metrics
        local memory_info=$(get_redis_info "memory")
        local used=$(parse_info "$memory_info" "used_memory_human")
        local peak=$(parse_info "$memory_info" "peak_memory_human")
        local max=$(parse_info "$memory_info" "maxmemory_human")

        log_metric "MEMORY METRICS"
        log_metric "├─ Used: $used"
        log_metric "├─ Peak: $peak"
        log_metric "└─ Max: $max"

        # Client metrics
        local clients=$(parse_info "$(get_redis_info "clients")" "connected_clients")
        local blocked=$(parse_info "$(get_redis_info "clients")" "blocked_clients")

        log_metric ""
        log_metric "CLIENT METRICS"
        log_metric "├─ Connected: $clients"
        log_metric "└─ Blocked: $blocked"

        # Command stats
        local total_cmds=$(parse_info "$(get_redis_info "stats")" "total_commands_processed")
        local cmds_per_sec=$(parse_info "$(get_redis_info "stats")" "instantaneous_ops_per_sec")

        log_metric ""
        log_metric "COMMAND METRICS"
        log_metric "├─ Total Processed: $total_cmds"
        log_metric "└─ Ops/Sec: $cmds_per_sec"

        # Database metrics
        local dbsize=$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" DBSIZE 2>/dev/null | awk '{print $2}')

        log_metric ""
        log_metric "DATABASE METRICS"
        log_metric "└─ Total Keys: $dbsize"

        # Eviction metrics
        local evicted=$(parse_info "$(get_redis_info "stats")" "evicted_keys")
        local rejected=$(parse_info "$(get_redis_info "stats")" "rejected_connections")

        log_metric ""
        log_metric "EVICTION & ERRORS"
        log_metric "├─ Evicted Keys: $evicted"
        log_metric "└─ Rejected Connections: $rejected"

        # Persistence metrics
        local aof_enabled=$(parse_info "$(get_redis_info "persistence")" "aof_enabled")
        local rdb_changes=$(parse_info "$(get_redis_info "persistence")" "rdb_changes_since_last_save")

        log_metric ""
        log_metric "PERSISTENCE"
        log_metric "├─ AOF Enabled: $aof_enabled"
        log_metric "└─ RDB Changes: $rdb_changes"

        # Uptime
        local uptime=$(parse_info "$(get_redis_info "server")" "uptime_in_seconds")
        local uptime_formatted=$(date -u -d @${uptime} +%H:%M:%S 2>/dev/null || echo "N/A")

        log_metric ""
        log_metric "UPTIME: $uptime_formatted"

        # Slow log check
        local slow_log_len=$(docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" SLOWLOG LEN 2>/dev/null || echo 0)
        if [ "$slow_log_len" -gt 0 ]; then
            log_warning "Slow Log Entries: $slow_log_len"
        fi

        log_info "==============================================="
        log_info "Refreshing in ${REFRESH_INTERVAL}s (Press Ctrl+C to exit)"
        log_info "==============================================="

        sleep "$REFRESH_INTERVAL"
    done
}

# Display slow log
show_slow_log() {
    log_info "==============================================="
    log_info "Redis Slow Log (Last 10 entries)"
    log_info "==============================================="

    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" SLOWLOG GET 10
}

# Display command stats
show_command_stats() {
    log_info "==============================================="
    log_info "Redis Command Statistics"
    log_info "==============================================="

    docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" INFO commandstats | \
        grep "cmdstat_" | sort -t: -k2 -rn | head -20
}

# Main execution
main() {
    local command="${1:-health}"

    case "$command" in
        health)
            health_check
            ;;
        monitor)
            monitor_continuous
            ;;
        slowlog)
            show_slow_log
            ;;
        stats)
            show_command_stats
            ;;
        *)
            echo "Usage: $0 {health|monitor|slowlog|stats}"
            echo ""
            echo "Commands:"
            echo "  health              Show health status (one-time)"
            echo "  monitor             Continuous monitoring (refresh every ${REFRESH_INTERVAL}s)"
            echo "  slowlog             Show slow query log"
            echo "  stats               Show command statistics"
            echo ""
            echo "Environment Variables:"
            echo "  CONTAINER_NAME      Redis container name (default: emailclient-redis)"
            echo "  REDIS_PASSWORD      Redis password (default: redis_development_password)"
            echo "  REFRESH_INTERVAL    Monitor refresh interval in seconds (default: 5)"
            echo "  CHECK_INTERVAL      Container check interval in seconds (default: 30)"
            exit 1
            ;;
    esac
}

main "$@"
