#!/bin/bash

# Docker Build Verification Script
# Checks that all prerequisites are met before building Docker image

set -e

echo "🔍 Checking Docker build prerequisites..."
echo ""

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi
echo "✅ Dockerfile found"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi
echo "✅ package.json found"

# Check if workspace packages exist
if [ ! -d "packages/spark-tools" ]; then
    echo "❌ packages/spark-tools directory not found"
    exit 1
fi
echo "✅ packages/spark-tools directory found"

if [ ! -d "packages/spark" ]; then
    echo "❌ packages/spark directory not found"
    exit 1
fi
echo "✅ packages/spark directory found"

# Check if spark-tools is built
if [ ! -d "packages/spark-tools/dist" ]; then
    echo "⚠️  packages/spark-tools/dist not found - building now..."
    cd packages/spark-tools
    npm install
    npm run build
    cd ../..
    echo "✅ Built spark-tools"
else
    echo "✅ packages/spark-tools/dist found"
fi

# Verify critical files in dist
CRITICAL_FILES=(
    "packages/spark-tools/dist/sparkVitePlugin.js"
    "packages/spark-tools/dist/index.js"
    "packages/spark-tools/dist/spark.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done
echo "✅ All critical dist files present"

# Check Docker is available
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found - skipping Docker checks"
else
    echo "✅ Docker is available"
    docker --version
fi

echo ""
echo "🎉 All prerequisites satisfied!"
echo ""
echo "You can now build the Docker image with:"
echo "  docker build -t codeforge:local ."
echo ""
echo "Or run the full CI pipeline locally with GitHub Actions:"
echo "  act -j docker-build"
