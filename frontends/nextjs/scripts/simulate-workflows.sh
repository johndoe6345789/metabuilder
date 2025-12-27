#!/usr/bin/env bash
# Simulate GitHub Actions workflows by running the commands locally
# This provides a fallback when 'act' is not installed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
NEXTJS_ROOT="$PROJECT_ROOT/frontends/nextjs"

echo "🎭 GitHub Actions Workflow Simulator"
echo "====================================="
echo

# Function to run a job simulation
simulate_job() {
    local job_name="$1"
    echo "🏃 Simulating job: $job_name"
    echo "Working directory: $NEXTJS_ROOT"
    echo

    cd "$NEXTJS_ROOT"

    case "$job_name" in
        prisma-check)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "✅ Validating Prisma Schema..."
            DATABASE_URL="file:./dev.db" npx prisma validate
            ;;

        typecheck)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "🔍 Running TypeScript type check..."
            npm run typecheck
            ;;

        lint)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "🔍 Running ESLint..."
            npm run lint
            ;;

        test-unit)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "🧪 Running unit tests..."
            DATABASE_URL="file:./dev.db" npm run test:unit
            ;;

        build)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "🏗️  Building application..."
            DATABASE_URL="file:./dev.db" npm run build
            ;;

        test-e2e)
            echo "📦 Installing dependencies..."
            if command -v bun &> /dev/null; then
                bun install
            else
                npm ci || npm install
            fi
            echo
            echo "🗄️  Generating Prisma Client..."
            DATABASE_URL="file:./dev.db" npm run db:generate
            echo
            echo "🎭 Installing Playwright browsers..."
            npx playwright install --with-deps chromium
            echo
            echo "🧪 Running E2E tests..."
            DATABASE_URL="file:./dev.db" npm run test:e2e
            ;;

        *)
            echo "❌ Unknown job: $job_name"
            echo "Available jobs: prisma-check, typecheck, lint, test-unit, build, test-e2e"
            exit 1
            ;;
    esac

    echo
    echo "✅ Job '$job_name' completed successfully!"
}

# Show help if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [job-name]"
    echo
    echo "Available jobs:"
    echo "  prisma-check  - Validate Prisma setup"
    echo "  typecheck     - Run TypeScript type check"
    echo "  lint          - Run ESLint"
    echo "  test-unit     - Run unit tests"
    echo "  build         - Build application"
    echo "  test-e2e      - Run E2E tests"
    echo "  all           - Run all jobs in sequence"
    echo
    echo "Example:"
    echo "  $0 lint"
    echo "  $0 build"
    echo "  $0 all"
    exit 0
fi

JOB="$1"

if [ "$JOB" = "all" ]; then
    echo "🔄 Running all jobs in sequence..."
    echo
    simulate_job "prisma-check"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    simulate_job "typecheck"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    simulate_job "lint"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    simulate_job "test-unit"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    simulate_job "build"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "✅ All jobs completed successfully!"
else
    simulate_job "$JOB"
fi
