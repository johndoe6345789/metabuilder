#!/bin/bash
# Quick verification script for the new build

set -e

echo "=== Verifying DBAL Build with Environment Variables ==="
echo ""

# Check if image exists
if ! docker images | grep -q "dbal-daemon.*latest"; then
    echo "ERROR: dbal-daemon:latest image not found"
    exit 1
fi

echo "✓ Image dbal-daemon:latest exists"
echo ""

# Test 1: Check that env vars are required
echo "Test 1: Verify required env vars (expect failure without them)"
if docker run --rm --name dbal-verify-test dbal-daemon:latest 2>&1 | grep -q "Required environment variable"; then
    echo "✓ Required env var validation works"
else
    echo "✗ Missing required env var validation"
fi
echo ""

# Test 2: Start with proper configuration
echo "Test 2: Start daemon with full configuration"
docker run -d --rm \
  --name dbal-verify-daemon \
  -p 8080:8080 \
  -e DBAL_SCHEMA_DIR=/app/schemas/entities \
  -e DBAL_TEMPLATE_DIR=/app/templates/sql \
  -e DBAL_DATABASE_TYPE=sqlite \
  -e DBAL_DATABASE_PATH=/tmp/test.db \
  -e DBAL_BIND_ADDRESS=0.0.0.0 \
  -e DBAL_PORT=8080 \
  -e DBAL_LOG_LEVEL=debug \
  -e DBAL_MODE=development \
  -e DBAL_AUTO_CREATE_TABLES=true \
  -v "$(pwd)/../../shared/api/schema/entities:/app/schemas/entities:ro" \
  -v "$(pwd)/../../templates/sql:/app/templates/sql:ro" \
  dbal-daemon:latest

sleep 5

# Check logs for environment variable usage
echo ""
echo "Daemon logs (checking for env var config):"
docker logs dbal-verify-daemon 2>&1 | grep -E "(Config:|Loading|Template|Schema|DBAL)" | head -20

# Check if daemon is responding
echo ""
echo "Testing /health endpoint:"
if curl -sf http://localhost:8080/health > /dev/null; then
    echo "✓ Health endpoint responding"
else
    echo "✗ Health endpoint not responding"
fi

# Cleanup
docker stop dbal-verify-daemon 2>/dev/null || true

echo ""
echo "=== Verification Complete ==="
