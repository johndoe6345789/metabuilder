#!/usr/bin/env bash
# build-testcontainers.sh — builds the testcontainers Conan packages and uploads to Nexus.
#
# Builds:
#   - testcontainers-native/0.1.0  (C shared library, wraps testcontainers-go)
#   - testcontainers-sidecar/0.1.0 (Go binary sidecar for DBAL integration tests)
#
# Prerequisites:
#   - Go 1.21+      (brew install go)
#   - Conan 2.x     (pip install conan)
#   - Nexus running (docker compose -f deployment/docker-compose.nexus.yml up -d)
#   - Nexus init    (./deployment/nexus-init.sh)
#
# Usage:
#   ./deployment/build-testcontainers.sh [--skip-native] [--skip-sidecar]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RECIPES_DIR="$REPO_ROOT/dbal/production/build-config/conan-recipes"

NEXUS_URL="${NEXUS_URL:-http://localhost:8091/repository/conan-hosted/}"
NEXUS_USER="${NEXUS_USER:-admin}"
NEXUS_PASS="${NEXUS_PASS:-nexus}"

SKIP_NATIVE=false
SKIP_SIDECAR=false
for arg in "$@"; do
  case "$arg" in
    --skip-native)  SKIP_NATIVE=true ;;
    --skip-sidecar) SKIP_SIDECAR=true ;;
  esac
done

log() { echo "[build-testcontainers] $*"; }

# ── Preflight checks ──────────────────────────────────────────────────────────
log "Checking prerequisites..."
go version    || { echo "Go not found. Install: https://go.dev/dl/"; exit 1; }
conan --version || { echo "Conan not found. Install: pip install conan"; exit 1; }

# ── Configure Nexus as Conan remote ───────────────────────────────────────────
log "Configuring Nexus Conan remote..."
conan remote add nexus "$NEXUS_URL" --force 2>/dev/null || true
conan remote login nexus "$NEXUS_USER" --password "$NEXUS_PASS"

# Ensure Nexus is before conancenter in priority (for future installs)
conan remote disable conancenter 2>/dev/null || true
conan remote enable conancenter  2>/dev/null || true
# Move nexus to index 0
conan remote update nexus --index 0 2>/dev/null || true

# ── Build + upload testcontainers-native ──────────────────────────────────────
if [ "$SKIP_NATIVE" = false ]; then
  log "Building testcontainers-native/0.1.0 (C shared library)..."
  log "  Requires: Go + CMake + Docker"
  conan create "$RECIPES_DIR/testcontainers-native" \
    -s build_type=Release \
    -s compiler.cppstd=20 \
    --build=missing

  log "Uploading testcontainers-native to Nexus..."
  conan upload "testcontainers-native/0.1.0" --remote nexus --confirm
  log "testcontainers-native uploaded ✓"
else
  log "Skipping testcontainers-native (--skip-native)"
fi

# ── Build + upload testcontainers-sidecar ─────────────────────────────────────
if [ "$SKIP_SIDECAR" = false ]; then
  SIDECAR_SRC="$REPO_ROOT/dbal/testcontainers-sidecar"
  log "Building testcontainers-sidecar/0.1.0 (Go binary)..."
  log "  Source: $SIDECAR_SRC"

  # Export TESTCONTAINERS_SIDECAR_SRC so the Conan recipe's build() can find it
  TESTCONTAINERS_SIDECAR_SRC="$SIDECAR_SRC" \
  conan create "$RECIPES_DIR/testcontainers-sidecar" \
    -s build_type=Release \
    -s compiler.cppstd=20 \
    --build=missing

  log "Uploading testcontainers-sidecar to Nexus..."
  conan upload "testcontainers-sidecar/0.1.0" --remote nexus --confirm
  log "testcontainers-sidecar uploaded ✓"
else
  log "Skipping testcontainers-sidecar (--skip-sidecar)"
fi

log ""
log "══════════════════════════════════════════"
log "  Conan packages in Nexus:"
log "  http://localhost:8091/#browse/browse:conan-hosted"
log ""
log "  To use in DBAL tests:"
log "    conan remote add nexus $NEXUS_URL --force"
log "    conan remote login nexus $NEXUS_USER --password $NEXUS_PASS"
log "    cd dbal/production/_build"
log "    conan install ../build-config/conanfile.tests.py \\"
log "      --output-folder=. --build=missing --remote nexus \\"
log "      -s build_type=Debug -s compiler.cppstd=20"
log "    cmake .. -DBUILD_DAEMON=OFF -DBUILD_INTEGRATION_TESTS=ON \\"
log "      -DCMAKE_TOOLCHAIN_FILE=./build/Debug/generators/conan_toolchain.cmake -G Ninja"
log "    cmake --build . --target dbal_integration_tests --parallel"
log "    ctest -R dbal_integration_tests --output-on-failure -V"
log "══════════════════════════════════════════"
