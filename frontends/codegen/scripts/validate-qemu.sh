#!/bin/bash

# QEMU Multi-Architecture Validation Script
# This script validates that QEMU is properly configured and multi-arch builds work

set -e

echo "🔍 QEMU Multi-Architecture Validation"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

echo -e "${BLUE}Step 1: Checking Docker installation${NC}"
echo "--------------------------------------"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_result 0 "Docker is installed: $DOCKER_VERSION"
else
    print_result 1 "Docker is not installed"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking Docker Buildx${NC}"
echo "--------------------------------------"

if docker buildx version &> /dev/null; then
    BUILDX_VERSION=$(docker buildx version)
    print_result 0 "Docker Buildx is available: $BUILDX_VERSION"
else
    print_result 1 "Docker Buildx is not available"
    echo "Installing Docker Buildx..."
    docker buildx install
fi

echo ""
echo -e "${BLUE}Step 3: Setting up QEMU${NC}"
echo "--------------------------------------"

echo "Installing QEMU user static binaries..."
if docker run --rm --privileged multiarch/qemu-user-static --reset -p yes > /dev/null 2>&1; then
    print_result 0 "QEMU installation successful"
else
    print_result 1 "QEMU installation failed"
fi

echo ""
echo -e "${BLUE}Step 4: Checking QEMU binaries${NC}"
echo "--------------------------------------"

if docker run --rm multiarch/qemu-user-static --version > /dev/null 2>&1; then
    QEMU_VERSION=$(docker run --rm multiarch/qemu-user-static --version | head -n 1)
    print_result 0 "QEMU binaries are functional: $QEMU_VERSION"
else
    print_result 1 "QEMU binaries not accessible"
fi

echo ""
echo -e "${BLUE}Step 5: Setting up Buildx builder${NC}"
echo "--------------------------------------"

if docker buildx inspect multiarch &> /dev/null; then
    echo "Builder 'multiarch' already exists"
    docker buildx use multiarch
    print_result 0 "Using existing builder 'multiarch'"
else
    if docker buildx create --name multiarch --driver docker-container --use > /dev/null 2>&1; then
        print_result 0 "Created new builder 'multiarch'"
    else
        print_result 1 "Failed to create builder"
    fi
fi

if docker buildx inspect --bootstrap > /dev/null 2>&1; then
    print_result 0 "Builder bootstrap successful"
else
    print_result 1 "Builder bootstrap failed"
fi

echo ""
echo -e "${BLUE}Step 6: Checking supported platforms${NC}"
echo "--------------------------------------"

PLATFORMS=$(docker buildx inspect multiarch | grep "Platforms:" | cut -d: -f2)
echo "Available platforms:$PLATFORMS"

if echo "$PLATFORMS" | grep -q "linux/amd64"; then
    print_result 0 "AMD64 platform supported"
else
    print_result 1 "AMD64 platform not supported"
fi

if echo "$PLATFORMS" | grep -q "linux/arm64"; then
    print_result 0 "ARM64 platform supported"
else
    print_result 1 "ARM64 platform not supported"
fi

echo ""
echo -e "${BLUE}Step 7: Testing multi-arch build (dry run)${NC}"
echo "--------------------------------------"

# Create a simple test Dockerfile
TEST_DIR=$(mktemp -d)
cat > "$TEST_DIR/Dockerfile" << 'EOF'
FROM alpine:latest
RUN echo "Architecture: $(uname -m)"
CMD ["echo", "Multi-arch test successful"]
EOF

echo "Testing build for linux/amd64..."
if docker buildx build --platform linux/amd64 -t test-qemu:amd64 "$TEST_DIR" > /dev/null 2>&1; then
    print_result 0 "AMD64 build successful"
else
    print_result 1 "AMD64 build failed"
fi

echo "Testing build for linux/arm64..."
if docker buildx build --platform linux/arm64 -t test-qemu:arm64 "$TEST_DIR" > /dev/null 2>&1; then
    print_result 0 "ARM64 build successful (cross-compiled)"
else
    print_result 1 "ARM64 build failed"
fi

echo "Testing multi-platform build..."
if docker buildx build --platform linux/amd64,linux/arm64 -t test-qemu:multi "$TEST_DIR" > /dev/null 2>&1; then
    print_result 0 "Multi-platform build successful"
else
    print_result 1 "Multi-platform build failed"
fi

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo -e "${BLUE}Step 8: Validating CI/CD configurations${NC}"
echo "--------------------------------------"

# Check GitHub Actions
if grep -q "docker/setup-qemu-action" .github/workflows/ci.yml 2>/dev/null; then
    print_result 0 "GitHub Actions CI has QEMU configured"
else
    print_result 1 "GitHub Actions CI missing QEMU"
fi

if grep -q "docker/setup-qemu-action" .github/workflows/release.yml 2>/dev/null; then
    print_result 0 "GitHub Actions Release has QEMU configured"
else
    print_result 1 "GitHub Actions Release missing QEMU"
fi

# Check CircleCI
if grep -q "multiarch/qemu-user-static" .circleci/config.yml 2>/dev/null; then
    print_result 0 "CircleCI has QEMU configured"
else
    print_result 1 "CircleCI missing QEMU"
fi

# Check GitLab CI
if grep -q "multiarch/qemu-user-static" .gitlab-ci.yml 2>/dev/null; then
    print_result 0 "GitLab CI has QEMU configured"
else
    print_result 1 "GitLab CI missing QEMU"
fi

# Check Jenkins
if grep -q "multiarch/qemu-user-static" Jenkinsfile 2>/dev/null; then
    print_result 0 "Jenkins has QEMU configured"
else
    print_result 1 "Jenkins missing QEMU"
fi

echo ""
echo "======================================"
echo -e "${BLUE}Validation Summary${NC}"
echo "======================================"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    echo ""
    echo "Your system is ready for multi-architecture builds."
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/build-multiarch.sh myapp latest"
    echo "  2. Or push to CI/CD and watch multi-arch builds happen automatically"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some validations failed${NC}"
    echo ""
    echo "Please review the failures above and fix them before proceeding."
    echo ""
    echo "Common fixes:"
    echo "  - Install Docker: https://docs.docker.com/get-docker/"
    echo "  - Update Docker to latest version"
    echo "  - Run with sudo if permission denied"
    echo ""
    exit 1
fi
