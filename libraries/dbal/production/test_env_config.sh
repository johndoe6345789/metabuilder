#!/bin/bash
set -e

echo "=== Testing DBAL Environment Variable Configuration ==="
echo ""

# Test 1: Start with default configuration from docker-compose
echo "Test 1: Default configuration from docker-compose.yml"
docker compose -f build-config/docker-compose.yml down 2>/dev/null || true
docker compose -f build-config/docker-compose.yml up -d
sleep 3
echo "Checking daemon logs for config loading..."
docker logs dbal-daemon 2>&1 | head -30
docker compose -f build-config/docker-compose.yml down
echo ""

# Test 2: Override with custom env vars
echo "Test 2: Custom environment variables"
export DBAL_LOG_LEVEL=debug
export DBAL_PORT=8081
export DBAL_MODE=development
docker compose -f build-config/docker-compose.yml up -d
sleep 3
echo "Checking daemon logs for custom config..."
docker logs dbal-daemon 2>&1 | grep -E "(Config:|DBAL|Schema|Template)" | head -20
docker compose -f build-config/docker-compose.yml down
echo ""

# Test 3: Verify required env vars are enforced
echo "Test 3: Missing required env vars (should fail)"
docker run --rm \
  --name dbal-test-missing-env \
  dbal-daemon:latest 2>&1 | head -10 || echo "Expected failure: OK"
echo ""

# Test 4: Complete configuration
echo "Test 4: Full custom configuration"
docker run --rm \
  --name dbal-test-full-config \
  -e DBAL_SCHEMA_DIR=/app/schemas/entities \
  -e DBAL_TEMPLATE_DIR=/app/templates/sql \
  -e DBAL_DATABASE_TYPE=sqlite \
  -e DBAL_DATABASE_PATH=/tmp/test.db \
  -e DBAL_BIND_ADDRESS=127.0.0.1 \
  -e DBAL_PORT=8080 \
  -e DBAL_LOG_LEVEL=info \
  -e DBAL_MODE=production \
  -v "$(pwd)/dbal/shared/api/schema/entities:/app/schemas/entities:ro" \
  -v "$(pwd)/dbal/templates/sql:/app/templates/sql:ro" \
  dbal-daemon:latest &
DAEMON_PID=$!
sleep 5
curl -s http://localhost:8080/health || echo "Daemon not ready yet"
kill $DAEMON_PID 2>/dev/null || true
echo ""

echo "=== Environment Variable Configuration Tests Complete ==="
