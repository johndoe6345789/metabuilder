#!/bin/sh
# PostgreSQL Health Check Script
# Verifies that PostgreSQL is running and responsive on port 5432
# Used by Docker health checks and orchestration systems

set -e

# PostgreSQL connection parameters
HOST="${POSTGRES_HOST:-localhost}"
PORT="${POSTGRES_PORT:-5432}"
USER="${POSTGRES_USER:-postgres}"
DB="${POSTGRES_DB:-postgres}"

# Timeout for health check (seconds)
TIMEOUT=5

# Check if PostgreSQL is listening on the port
if ! command -v pg_isready &> /dev/null; then
  # Fallback: use psql if pg_isready is not available
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT 1" > /dev/null 2>&1
  exit $?
fi

# Use pg_isready for health check (preferred, faster)
pg_isready -h "$HOST" -p "$PORT" -U "$USER" -t "$TIMEOUT"
exit $?
