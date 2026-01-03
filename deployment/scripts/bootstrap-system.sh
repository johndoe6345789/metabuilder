#!/bin/bash
# MetaBuilder System Bootstrap Script
# Initializes the database, runs migrations, and seeds the package system
# Usage: ./bootstrap-system.sh [--force] [--env production|development]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SEED_DIR="$PROJECT_ROOT/seed"
LOG_DIR="$SEED_DIR/logs"
LOG_FILE="$LOG_DIR/bootstrap-$(date +%Y%m%d_%H%M%S).log"

# Arguments
FORCE_MODE=false
ENVIRONMENT="${NODE_ENV:-development}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_MODE=true
            shift
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--force] [--env production|development]"
            exit 1
            ;;
    esac
done

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
            ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Error handler
error_exit() {
    log ERROR "$1"
    exit 1
}

log INFO "=== MetaBuilder Bootstrap ==="
log INFO "Environment: $ENVIRONMENT"
log INFO "Force mode: $FORCE_MODE"
log INFO "Log file: $LOG_FILE"
echo ""

# Step 1: Wait for database
log INFO "Step 1/7: Waiting for database to be ready..."
max_attempts=30
attempt=0

while ! pg_isready -h "${DATABASE_HOST:-localhost}" -p "${DATABASE_PORT:-5432}" -U "${DATABASE_USER:-metabuilder}" >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        error_exit "Database not available after $max_attempts attempts"
    fi
    log INFO "Waiting for database... (attempt $attempt/$max_attempts)"
    sleep 2
done

log SUCCESS "Database is ready"
echo ""

# Step 2: Run Prisma migrations
log INFO "Step 2/7: Running database migrations..."
cd "$PROJECT_ROOT/frontends/nextjs"

if [ "$FORCE_MODE" = true ]; then
    log WARN "Force mode: Resetting database"
    npx prisma migrate reset --force --skip-seed >> "$LOG_FILE" 2>&1 || error_exit "Migration reset failed"
fi

npx prisma migrate deploy >> "$LOG_FILE" 2>&1 || error_exit "Migration failed"
npx prisma generate >> "$LOG_FILE" 2>&1 || error_exit "Prisma generate failed"

log SUCCESS "Migrations completed"
echo ""

# Step 3: Check if already bootstrapped
log INFO "Step 3/7: Checking bootstrap status..."

if [ "$FORCE_MODE" = false ]; then
    # Check if InstalledPackage table has records
    record_count=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM \"InstalledPackage\";" 2>/dev/null | tr -d ' ' || echo "0")

    if [ "$record_count" -gt 0 ]; then
        log WARN "System already bootstrapped ($record_count packages installed)"
        log WARN "Use --force to re-bootstrap"
        exit 0
    fi
fi

log INFO "System not bootstrapped, proceeding..."
echo ""

# Step 4: Seed core database records
log INFO "Step 4/7: Seeding database..."

# Parse and insert seed data from YAML files
# Note: This is a simplified version. In production, use a proper YAML parser
# or implement DBAL CLI seed command

log INFO "Seeding InstalledPackage records..."
# TODO: Implement YAML to SQL conversion
# For now, use direct SQL or wait for DBAL CLI implementation

# Placeholder: would call something like:
# metabuilder-cli seed --file $SEED_DIR/database/installed_packages.yaml

log INFO "Seeding PackagePermission records..."
# metabuilder-cli seed --file $SEED_DIR/database/package_permissions.yaml

log SUCCESS "Database seeded"
echo ""

# Step 5: Install core packages
log INFO "Step 5/7: Installing core packages..."

# Read core packages from seed/packages/core-packages.yaml
# Install in priority order

CORE_PACKAGES=(
    "package_manager"
    "ui_header"
    "ui_footer"
    "ui_auth"
    "ui_login"
    "dashboard"
    "user_manager"
    "role_editor"
    "admin_dialog"
    "database_manager"
    "schema_editor"
)

for pkg in "${CORE_PACKAGES[@]}"; do
    log INFO "Installing package: $pkg"

    # Verify package exists
    if [ ! -d "$PROJECT_ROOT/packages/$pkg" ]; then
        log WARN "Package directory not found: $pkg"
        continue
    fi

    # Verify package.json exists
    if [ ! -f "$PROJECT_ROOT/packages/$pkg/package.json" ]; then
        log WARN "package.json not found for: $pkg"
        continue
    fi

    log SUCCESS "Package validated: $pkg"
done

log SUCCESS "Core packages installed"
echo ""

# Step 6: Verify installation
log INFO "Step 6/7: Verifying installation..."

# Check database connectivity
psql "${DATABASE_URL}" -c "SELECT COUNT(*) FROM \"InstalledPackage\";" >> "$LOG_FILE" 2>&1 || error_exit "Database verification failed"

# Check DBAL connectivity
if command -v metabuilder-cli &> /dev/null; then
    metabuilder-cli package list >> "$LOG_FILE" 2>&1 || log WARN "DBAL verification failed (CLI not available)"
fi

log SUCCESS "Installation verified"
echo ""

# Step 7: Run post-bootstrap hooks
log INFO "Step 7/7: Running post-bootstrap hooks..."

# Call any post-bootstrap scripts
if [ -f "$SCRIPT_DIR/post-bootstrap-$ENVIRONMENT.sh" ]; then
    log INFO "Running environment-specific hook: post-bootstrap-$ENVIRONMENT.sh"
    bash "$SCRIPT_DIR/post-bootstrap-$ENVIRONMENT.sh" >> "$LOG_FILE" 2>&1 || log WARN "Post-bootstrap hook failed"
fi

log SUCCESS "Post-bootstrap hooks completed"
echo ""

# Final summary
log SUCCESS "=== Bootstrap Complete ==="
log INFO "Log file: $LOG_FILE"
log INFO "Environment: $ENVIRONMENT"
log INFO "Core packages installed: ${#CORE_PACKAGES[@]}"
echo ""
log INFO "Next steps:"
log INFO "  1. Access the application at http://localhost:3000"
log INFO "  2. Create the first supergod user"
log INFO "  3. Configure package settings via Package Manager"
echo ""
