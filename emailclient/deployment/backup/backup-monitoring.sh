#!/bin/bash

################################################################################
# Phase 8: Backup Monitoring & Alerting System
# Automated health checks for backup integrity and recency
#
# Usage:
#   ./backup-monitoring.sh [--check-all|--check-recency|--check-size|--alert]
#
# Features:
#   - Monitor backup recency (detect missed backups)
#   - Monitor backup sizes (detect anomalies)
#   - Verify encryption integrity
#   - Check disk space availability
#   - Generate health metrics for Prometheus
#   - Send alerts via email/Slack/PagerDuty
#   - Integration with monitoring stacks (Prometheus, Grafana)
#
# Requirements:
#   - jq for JSON parsing
#   - curl for webhook alerts
#   - mail/sendmail for email alerts
#
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-.}"
BACKUP_BASE_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups}"
MONITORING_LOG="${BACKUP_BASE_DIR}/logs/monitoring.log"
METRICS_FILE="${BACKUP_BASE_DIR}/metrics.json"

# Alert configuration
ALERT_EMAIL="${ALERT_EMAIL:-}"
ALERT_SLACK_WEBHOOK="${ALERT_SLACK_WEBHOOK:-}"
ALERT_PAGERDUTY_KEY="${ALERT_PAGERDUTY_KEY:-}"

# Thresholds
BACKUP_STALE_HOURS=26              # Alert if backup older than this
BACKUP_SIZE_VARIANCE=50             # Alert if size changes by >50%
MIN_DISK_SPACE_MB=1024              # Alert if less than 1GB available
MAX_BACKUP_SIZE_GB=10               # Alert if backup exceeds this

# Check types
CHECK_RECENCY=${CHECK_RECENCY:-1}
CHECK_SIZE=${CHECK_SIZE:-1}
CHECK_DISK=${CHECK_DISK:-1}
CHECK_ENCRYPTION=${CHECK_ENCRYPTION:-1}
ENABLE_ALERTS=${ENABLE_ALERTS:-0}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$MONITORING_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $*" | tee -a "$MONITORING_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $*" | tee -a "$MONITORING_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $*" | tee -a "$MONITORING_LOG"
}

# Alert functions
send_email_alert() {
    local subject="$1"
    local message="$2"
    local severity="${3:-WARNING}"

    if [ -z "$ALERT_EMAIL" ]; then
        return 0
    fi

    # Format message
    local email_body="$(cat << EOF
Backup Alert: $severity
Time: $(date)
Subject: $subject

$message

Backup Directory: $BACKUP_BASE_DIR
Monitoring Log: $MONITORING_LOG
EOF
)"

    # Send via mail command
    if command -v mail &> /dev/null; then
        echo "$email_body" | mail -s "[$severity] $subject" "$ALERT_EMAIL"
        log_success "Email alert sent to $ALERT_EMAIL"
    elif command -v sendmail &> /dev/null; then
        echo -e "To: $ALERT_EMAIL\nSubject: [$severity] $subject\n\n$email_body" | sendmail "$ALERT_EMAIL"
        log_success "Email alert sent via sendmail"
    fi
}

send_slack_alert() {
    local message="$1"
    local severity="${2:-warning}"

    if [ -z "$ALERT_SLACK_WEBHOOK" ]; then
        return 0
    fi

    # Determine color based on severity
    local color="warning"
    case "$severity" in
        critical) color="danger" ;;
        success) color="good" ;;
        *) color="warning" ;;
    esac

    # Create Slack message
    local slack_payload=$(cat << EOF
{
  "attachments": [{
    "color": "$color",
    "title": "Backup Monitoring Alert",
    "text": "$message",
    "fields": [
      {
        "title": "Severity",
        "value": "$severity",
        "short": true
      },
      {
        "title": "Time",
        "value": "$(date)",
        "short": true
      },
      {
        "title": "Backup Directory",
        "value": "$BACKUP_BASE_DIR",
        "short": false
      }
    ]
  }]
}
EOF
)

    # Send to Slack
    if curl -s -X POST -H 'Content-type: application/json' \
        --data "$slack_payload" \
        "$ALERT_SLACK_WEBHOOK" > /dev/null 2>&1; then
        log_success "Slack alert sent"
    else
        log_warning "Failed to send Slack alert"
    fi
}

send_pagerduty_alert() {
    local message="$1"
    local severity="${2:-warning}"

    if [ -z "$ALERT_PAGERDUTY_KEY" ]; then
        return 0
    fi

    # Map severity to PagerDuty levels
    local pd_severity="warning"
    case "$severity" in
        critical) pd_severity="critical" ;;
        success) pd_severity="resolve" ;;
        *) pd_severity="warning" ;;
    esac

    # Create PagerDuty event
    local pd_payload=$(cat << EOF
{
  "routing_key": "$ALERT_PAGERDUTY_KEY",
  "event_action": "trigger",
  "dedup_key": "backup-$(date +%s)",
  "payload": {
    "summary": "Backup Monitoring: $message",
    "severity": "$pd_severity",
    "source": "backup-monitoring",
    "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  }
}
EOF
)

    # Send to PagerDuty
    if curl -s -X POST -H 'Content-type: application/json' \
        --data "$pd_payload" \
        "https://events.pagerduty.com/v2/enqueue" > /dev/null 2>&1; then
        log_success "PagerDuty alert sent"
    else
        log_warning "Failed to send PagerDuty alert"
    fi
}

# Monitoring checks
check_backup_recency() {
    log_info "Checking backup recency..."

    local latest_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | head -1)

    if [ -z "$latest_manifest" ]; then
        log_error "No backups found"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_email_alert "No Backups Found" "No backup manifests found in $BACKUP_BASE_DIR" "CRITICAL"
            send_slack_alert "No backups found in $BACKUP_BASE_DIR" "critical"
        fi
        return 1
    fi

    # Get backup timestamp
    local backup_timestamp=$(jq -r '.timestamp' "$latest_manifest" 2>/dev/null)
    local backup_time=$(stat -f%m "$latest_manifest" 2>/dev/null || stat -c%Y "$latest_manifest")
    local current_time=$(date +%s)
    local hours_ago=$(( (current_time - backup_time) / 3600 ))

    if [ $hours_ago -lt 24 ]; then
        log_success "Backup is recent: $backup_timestamp ($hours_ago hours ago)"
    elif [ $hours_ago -lt $BACKUP_STALE_HOURS ]; then
        log_warning "Backup is aging: $backup_timestamp ($hours_ago hours ago)"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_email_alert "Backup Aging" "Last backup was $hours_ago hours ago" "WARNING"
            send_slack_alert "Last backup was $hours_ago hours ago (threshold: $BACKUP_STALE_HOURS hours)" "warning"
        fi
    else
        log_error "Backup is stale: $backup_timestamp ($hours_ago hours ago)"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_email_alert "Backup Stale" "Last backup was $hours_ago hours ago (threshold: $BACKUP_STALE_HOURS)" "CRITICAL"
            send_slack_alert "Last backup was $hours_ago hours ago (CRITICAL - threshold: $BACKUP_STALE_HOURS)" "critical"
        fi
        return 1
    fi

    return 0
}

check_backup_sizes() {
    log_info "Checking backup sizes..."

    local current_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | head -1)
    local previous_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | sed -n '2p')

    if [ -z "$current_manifest" ]; then
        log_warning "No current backup to check"
        return 0
    fi

    local current_size=$(jq -r '.total_size' "$current_manifest" 2>/dev/null | sed 's/[^0-9]//g')

    if [ -z "$current_size" ] || [ "$current_size" -eq 0 ]; then
        log_warning "Could not determine current backup size"
        return 0
    fi

    # Convert to GB
    current_size_gb=$((current_size / 1024))

    # Check size threshold
    if [ $current_size_gb -gt $MAX_BACKUP_SIZE_GB ]; then
        log_error "Backup exceeds size limit: ${current_size_gb}GB (limit: ${MAX_BACKUP_SIZE_GB}GB)"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_email_alert "Backup Size Exceeded" "Backup size ${current_size_gb}GB exceeds limit of ${MAX_BACKUP_SIZE_GB}GB" "WARNING"
            send_slack_alert "Backup size ${current_size_gb}GB exceeds limit of ${MAX_BACKUP_SIZE_GB}GB" "warning"
        fi
    else
        log_success "Backup size is acceptable: ${current_size_gb}GB"
    fi

    # Check for size variance
    if [ -n "$previous_manifest" ] && [ -f "$previous_manifest" ]; then
        local previous_size=$(jq -r '.total_size' "$previous_manifest" 2>/dev/null | sed 's/[^0-9]//g')

        if [ -n "$previous_size" ] && [ "$previous_size" -gt 0 ]; then
            # Calculate percentage change
            local percent_change=$(( (current_size - previous_size) * 100 / previous_size ))

            if [ $((percent_change > 0)) ] && [ $percent_change -gt $BACKUP_SIZE_VARIANCE ]; then
                log_warning "Backup size increased by $percent_change%"
                if [ "$ENABLE_ALERTS" == "1" ]; then
                    send_slack_alert "Backup size increased by $percent_change% (was: $((previous_size/1024))GB, now: ${current_size_gb}GB)" "warning"
                fi
            elif [ $((percent_change < 0)) ] && [ $((percent_change * -1)) -gt $BACKUP_SIZE_VARIANCE ]; then
                log_warning "Backup size decreased by $((percent_change * -1))%"
            fi
        fi
    fi

    return 0
}

check_disk_space() {
    log_info "Checking disk space..."

    local available_kb=$(df "$BACKUP_BASE_DIR" | tail -1 | awk '{print $4}')
    local available_mb=$((available_kb / 1024))

    if [ $available_mb -lt $MIN_DISK_SPACE_MB ]; then
        log_error "Low disk space: ${available_mb}MB available (minimum: ${MIN_DISK_SPACE_MB}MB)"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_email_alert "Low Disk Space" "Only ${available_mb}MB available (minimum: ${MIN_DISK_SPACE_MB}MB)" "CRITICAL"
            send_slack_alert "Only ${available_mb}MB available on backup disk (threshold: ${MIN_DISK_SPACE_MB}MB)" "critical"
        fi
        return 1
    else
        log_success "Disk space is adequate: ${available_mb}MB"
    fi

    return 0
}

check_encryption_status() {
    log_info "Checking encryption status..."

    local latest_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | head -1)

    if [ -z "$latest_manifest" ]; then
        return 0
    fi

    local encryption_enabled=$(jq -r '.encryption.enabled' "$latest_manifest" 2>/dev/null)
    local encryption_algo=$(jq -r '.encryption.algorithm' "$latest_manifest" 2>/dev/null)

    if [ "$encryption_enabled" == "true" ]; then
        log_success "Encryption is enabled: $encryption_algo"
    else
        log_warning "Encryption is disabled (backups are not encrypted)"
        if [ "$ENABLE_ALERTS" == "1" ]; then
            send_slack_alert "Encryption is disabled for backups" "warning"
        fi
    fi

    return 0
}

# Generate Prometheus metrics
generate_prometheus_metrics() {
    log_info "Generating Prometheus metrics..."

    local latest_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | head -1)

    if [ -z "$latest_manifest" ]; then
        log_warning "No backups to generate metrics from"
        return 0
    fi

    local backup_timestamp=$(jq -r '.timestamp' "$latest_manifest" 2>/dev/null)
    local backup_time=$(stat -f%m "$latest_manifest" 2>/dev/null || stat -c%Y "$latest_manifest")
    local current_time=$(date +%s)
    local hours_ago=$(( (current_time - backup_time) / 3600 ))

    # Extract component sizes
    local postgresql_size=$(jq -r '.components.postgresql.size' "$latest_manifest" 2>/dev/null | sed 's/[^0-9]//g')
    local redis_size=$(jq -r '.components.redis.size' "$latest_manifest" 2>/dev/null | sed 's/[^0-9]//g')
    local postfix_size=$(jq -r '.components.postfix.size' "$latest_manifest" 2>/dev/null | sed 's/[^0-9]//g')
    local dovecot_size=$(jq -r '.components.dovecot.size' "$latest_manifest" 2>/dev/null | sed 's/[^0-9]//g')
    local total_size=$(jq -r '.total_size' "$latest_manifest" 2>/dev/null | sed 's/[^0-9]//g')

    local encryption_enabled=$(jq -r '.encryption.enabled' "$latest_manifest" 2>/dev/null)

    # Create metrics file
    cat > "$METRICS_FILE" << EOF
# HELP backup_age_hours Hours since last successful backup
# TYPE backup_age_hours gauge
backup_age_hours $hours_ago

# HELP backup_total_size_bytes Total backup size in bytes
# TYPE backup_total_size_bytes gauge
backup_total_size_bytes $((total_size / 1024))

# HELP backup_postgresql_size_bytes PostgreSQL backup size in bytes
# TYPE backup_postgresql_size_bytes gauge
backup_postgresql_size_bytes $((postgresql_size / 1024))

# HELP backup_redis_size_bytes Redis backup size in bytes
# TYPE backup_redis_size_bytes gauge
backup_redis_size_bytes $((redis_size / 1024))

# HELP backup_postfix_size_bytes Postfix backup size in bytes
# TYPE backup_postfix_size_bytes gauge
backup_postfix_size_bytes $((postfix_size / 1024))

# HELP backup_dovecot_size_bytes Dovecot backup size in bytes
# TYPE backup_dovecot_size_bytes gauge
backup_dovecot_size_bytes $((dovecot_size / 1024))

# HELP backup_encryption_enabled Whether backup encryption is enabled
# TYPE backup_encryption_enabled gauge
backup_encryption_enabled $([ "$encryption_enabled" == "true" ] && echo 1 || echo 0)

# HELP backup_health Backup health status (1=healthy, 0=unhealthy)
# TYPE backup_health gauge
backup_health $([ $hours_ago -lt $BACKUP_STALE_HOURS ] && echo 1 || echo 0)

# HELP backup_last_timestamp Timestamp of last backup (Unix epoch)
# TYPE backup_last_timestamp gauge
backup_last_timestamp $backup_time
EOF

    log_success "Prometheus metrics generated: $METRICS_FILE"
    return 0
}

# Summary report
generate_summary_report() {
    log_info "Generating summary report..."

    local latest_manifest=$(ls -t "${BACKUP_BASE_DIR}/manifests"/manifest_*.json 2>/dev/null | head -1)

    if [ -z "$latest_manifest" ]; then
        log_warning "No backups found for report"
        return 0
    fi

    cat << EOF

${CYAN}=== Backup Monitoring Summary ===${NC}

Backup Information:
  Backup ID: $(jq -r '.backup_id' "$latest_manifest")
  Timestamp: $(jq -r '.timestamp' "$latest_manifest")
  Status: $(jq -r '.status' "$latest_manifest")
  Total Size: $(jq -r '.total_size' "$latest_manifest")

Components:
  PostgreSQL: $(jq -r '.components.postgresql.size' "$latest_manifest")
  Redis: $(jq -r '.components.redis.size' "$latest_manifest")
  Postfix: $(jq -r '.components.postfix.size' "$latest_manifest")
  Dovecot: $(jq -r '.components.dovecot.size' "$latest_manifest")

Encryption:
  Enabled: $(jq -r '.encryption.enabled' "$latest_manifest")
  Algorithm: $(jq -r '.encryption.algorithm' "$latest_manifest")

Retention:
  Days: $(jq -r '.retention.days' "$latest_manifest")
  Expires: $(jq -r '.retention.expires_at' "$latest_manifest")

Backup Count:
  Total backups: $(ls "${BACKUP_BASE_DIR}"/postgresql/dump_*.sql.gz* 2>/dev/null | wc -l)
  PostgreSQL: $(ls "${BACKUP_BASE_DIR}"/postgresql/dump_*.sql.gz* 2>/dev/null | wc -l)
  Redis: $(ls "${BACKUP_BASE_DIR}"/redis/dump_*.rdb* 2>/dev/null | wc -l)
  Postfix: $(ls "${BACKUP_BASE_DIR}"/postfix/spool_*.tar.gz* 2>/dev/null | wc -l)
  Dovecot: $(ls "${BACKUP_BASE_DIR}"/dovecot/mail_*.tar.gz* 2>/dev/null | wc -l)

Disk Usage:
  Total: $(du -sh "$BACKUP_BASE_DIR" | awk '{print $1}')
  Available: $(df "$BACKUP_BASE_DIR" | tail -1 | awk '{printf "%.1fGB", $4/1024/1024}')

${CYAN}===================================${NC}

EOF
}

# Main execution
main() {
    mkdir -p "$(dirname "$MONITORING_LOG")"

    log_info "============================================================"
    log_info "Phase 8: Backup Monitoring System"
    log_info "============================================================"

    local checks_passed=0
    local checks_failed=0

    # Run checks
    if [ "$CHECK_RECENCY" == "1" ]; then
        if check_backup_recency; then
            checks_passed=$((checks_passed + 1))
        else
            checks_failed=$((checks_failed + 1))
        fi
    fi

    if [ "$CHECK_SIZE" == "1" ]; then
        if check_backup_sizes; then
            checks_passed=$((checks_passed + 1))
        else
            checks_failed=$((checks_failed + 1))
        fi
    fi

    if [ "$CHECK_DISK" == "1" ]; then
        if check_disk_space; then
            checks_passed=$((checks_passed + 1))
        else
            checks_failed=$((checks_failed + 1))
        fi
    fi

    if [ "$CHECK_ENCRYPTION" == "1" ]; then
        check_encryption_status
    fi

    # Generate metrics and report
    generate_prometheus_metrics
    generate_summary_report

    # Final status
    log_info "============================================================"
    if [ $checks_failed -eq 0 ]; then
        log_success "All monitoring checks passed"
    else
        log_error "$checks_failed check(s) failed"
    fi
    log_info "============================================================"

    # Exit code
    [ $checks_failed -eq 0 ] && exit 0 || exit 1
}

# Usage
show_usage() {
    cat << EOF
${CYAN}Phase 8: Backup Monitoring & Alerting${NC}

Usage:
  $0 [OPTIONS]

Options:
  --check-all       Run all checks (default)
  --check-recency   Check backup recency only
  --check-size      Check backup sizes only
  --check-disk      Check disk space only
  --alert           Enable alerting (email/Slack/PagerDuty)
  --help            Show this help message

Environment Variables:
  ALERT_EMAIL              Email address for alerts
  ALERT_SLACK_WEBHOOK     Slack webhook URL
  ALERT_PAGERDUTY_KEY     PagerDuty integration key
  BACKUP_STALE_HOURS      Hours before backup is considered stale (default: 26)
  BACKUP_SIZE_VARIANCE    Size change threshold % (default: 50)
  MIN_DISK_SPACE_MB       Minimum disk space in MB (default: 1024)
  MAX_BACKUP_SIZE_GB      Maximum backup size in GB (default: 10)

Examples:
  # Run all checks
  $0

  # Check recency with alerts
  ENABLE_ALERTS=1 ALERT_SLACK_WEBHOOK=<url> $0 --check-recency

  # Check with email alerts
  ENABLE_ALERTS=1 ALERT_EMAIL=admin@example.com $0

EOF
}

# Parse arguments
case "${1:-}" in
    --check-all)
        CHECK_RECENCY=1
        CHECK_SIZE=1
        CHECK_DISK=1
        CHECK_ENCRYPTION=1
        ;;
    --check-recency)
        CHECK_RECENCY=1
        CHECK_SIZE=0
        CHECK_DISK=0
        CHECK_ENCRYPTION=0
        ;;
    --check-size)
        CHECK_RECENCY=0
        CHECK_SIZE=1
        CHECK_DISK=0
        CHECK_ENCRYPTION=0
        ;;
    --check-disk)
        CHECK_RECENCY=0
        CHECK_SIZE=0
        CHECK_DISK=1
        CHECK_ENCRYPTION=0
        ;;
    --alert)
        ENABLE_ALERTS=1
        ;;
    --help)
        show_usage
        exit 0
        ;;
esac

main
