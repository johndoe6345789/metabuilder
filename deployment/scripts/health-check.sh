#!/bin/bash
# Phase 8: Email Client System Health Check
# Comprehensive health monitoring of all services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
check_service() {
  local name=$1
  local cmd=$2
  
  if eval "$cmd" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name"
    return 0
  else
    echo -e "${RED}✗${NC} $name"
    return 1
  fi
}

echo -e "${BLUE}Email Client System Health Check${NC}"
echo "=================================="
echo ""

# 1. Docker & Compose
echo -e "${BLUE}[1] Docker & Compose${NC}"
check_service "Docker daemon" "docker ps >/dev/null"
check_service "Docker Compose" "docker compose --version >/dev/null"
echo ""

# 2. Service Status
echo -e "${BLUE}[2] Service Status${NC}"
COMPOSE_CMD="docker compose -f $SCRIPT_DIR/docker-compose.yml"

for service in nginx emailclient email-service celery-worker postgres redis postfix dovecot; do
  STATUS=$($COMPOSE_CMD ps $service 2>/dev/null | grep -o "Up\|Exited\|Created" | head -1)
  HEALTH=$($COMPOSE_CMD ps $service 2>/dev/null | grep -o "healthy\|unhealthy\|starting" | head -1 || echo "")
  
  if [ "$STATUS" = "Up" ]; then
    if [ -n "$HEALTH" ]; then
      echo -e "${GREEN}✓${NC} $service ($STATUS - $HEALTH)"
    else
      echo -e "${GREEN}✓${NC} $service ($STATUS)"
    fi
  else
    echo -e "${RED}✗${NC} $service ($STATUS)"
  fi
done
echo ""

# 3. Network Connectivity
echo -e "${BLUE}[3] Network Connectivity${NC}"
check_service "Nginx health endpoint" "curl -sk https://localhost/health >/dev/null 2>&1 || curl -k http://localhost:80 >/dev/null 2>&1"
check_service "Email Service health" "curl -s http://localhost:5000/health >/dev/null 2>&1"
check_service "Frontend responding" "curl -s http://localhost:3000 >/dev/null 2>&1"
echo ""

# 4. Database Health
echo -e "${BLUE}[4] Database Health${NC}"
if check_service "PostgreSQL connection" "$COMPOSE_CMD exec -T postgres pg_isready -U emailclient >/dev/null 2>&1"; then
  DB_SIZE=$($COMPOSE_CMD exec -T postgres psql -U emailclient emailclient -t -c "SELECT pg_size_pretty(pg_database_size('emailclient'))" 2>/dev/null || echo "unknown")
  echo "  Database size: $DB_SIZE"
fi
echo ""

# 5. Cache Health
echo -e "${BLUE}[5] Cache & Message Broker${NC}"
if check_service "Redis connection" "$COMPOSE_CMD exec -T redis redis-cli ping >/dev/null 2>&1"; then
  MEMORY=$($COMPOSE_CMD exec -T redis redis-cli INFO memory 2>/dev/null | grep used_memory_human | cut -d: -f2 || echo "unknown")
  echo "  Memory usage: $MEMORY"
fi
echo ""

# 6. Email Service Health
echo -e "${BLUE}[6] Email Service${NC}"
check_service "Flask app running" "$COMPOSE_CMD logs email-service 2>/dev/null | grep -q 'Running on'"
check_service "Database migrations" "$COMPOSE_CMD exec -T postgres psql -U emailclient emailclient -t -c 'SELECT COUNT(*) FROM email_client' >/dev/null 2>&1"
echo ""

# 7. Celery Worker Health
echo -e "${BLUE}[7] Celery Worker${NC}"
if check_service "Worker active" "$COMPOSE_CMD exec celery-worker celery -A tasks.celery_app inspect active >/dev/null 2>&1"; then
  TASK_COUNT=$($COMPOSE_CMD exec celery-worker celery -A tasks.celery_app inspect stats 2>/dev/null | grep -o 'pool.*' | head -1 || echo "unknown")
  echo "  Worker stats: $TASK_COUNT"
fi
echo ""

# 8. Disk Space
echo -e "${BLUE}[8] Disk Space${NC}"
DISK_USAGE=$(df -h "$SCRIPT_DIR" | awk 'NR==2 {print $5}')
DISK_FREE=$(df -h "$SCRIPT_DIR" | awk 'NR==2 {print $4}')
echo "  Path: $SCRIPT_DIR"
echo "  Usage: $DISK_USAGE"
echo "  Free: $DISK_FREE"
echo ""

# 9. Resource Usage
echo -e "${BLUE}[9] Resource Usage${NC}"
echo "Container resource usage:"
docker compose -f "$SCRIPT_DIR/docker-compose.yml" stats --no-stream 2>/dev/null || echo "  (Docker stats unavailable)"
echo ""

# 10. Recent Logs
echo -e "${BLUE}[10] Recent Errors${NC}"
RECENT_ERRORS=$($COMPOSE_CMD logs --since 10m 2>&1 | grep -i "error\|fatal\|exception" | tail -5 || echo "  No recent errors")
if [ -z "$RECENT_ERRORS" ]; then
  echo "  No errors found in last 10 minutes"
else
  echo "$RECENT_ERRORS"
fi
echo ""

# Summary
echo -e "${BLUE}Summary${NC}"
echo "======="
echo -e "Run 'docker compose logs -f' to view real-time logs"
echo -e "Run 'docker compose exec postgres psql -U emailclient emailclient' to access database"
echo -e "Run 'docker compose exec redis redis-cli' to access Redis CLI"
