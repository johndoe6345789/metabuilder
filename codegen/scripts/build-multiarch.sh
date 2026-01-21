#!/bin/bash

# Multi-Architecture Docker Build Script
# This script demonstrates how to build multi-arch images locally with QEMU

set -e

echo "🚀 Multi-Architecture Docker Build with QEMU"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${1:-myapp}"
IMAGE_TAG="${2:-latest}"
PLATFORMS="${3:-linux/amd64,linux/arm64}"
REGISTRY="${4:-ghcr.io}"

echo "📋 Configuration:"
echo "  Image Name: $IMAGE_NAME"
echo "  Image Tag: $IMAGE_TAG"
echo "  Platforms: $PLATFORMS"
echo "  Registry: $REGISTRY"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker Buildx is available
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}❌ Docker Buildx is not available${NC}"
    echo "Installing Docker Buildx..."
    docker buildx install
fi

echo -e "${GREEN}✅ Docker Buildx is available${NC}"

# Set up QEMU
echo ""
echo "🔧 Setting up QEMU for multi-architecture builds..."
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ QEMU setup successful${NC}"
else
    echo -e "${RED}❌ QEMU setup failed${NC}"
    exit 1
fi

# Create or use existing buildx builder
echo ""
echo "🔧 Setting up Docker Buildx builder..."
if docker buildx inspect multiarch &> /dev/null; then
    echo -e "${YELLOW}⚠️  Builder 'multiarch' already exists, using existing${NC}"
    docker buildx use multiarch
else
    docker buildx create --name multiarch --driver docker-container --use
    echo -e "${GREEN}✅ Created new builder 'multiarch'${NC}"
fi

docker buildx inspect --bootstrap

# Build the multi-architecture image
echo ""
echo "🏗️  Building multi-architecture Docker image..."
echo "  This may take several minutes..."
echo ""

BUILD_ARGS=""
if [ "$5" = "--push" ]; then
    BUILD_ARGS="--push"
    echo "  Will push to registry after build"
else
    BUILD_ARGS="--load"
    echo "  Will load into local Docker daemon (single platform)"
    # When loading, we can only build for one platform
    PLATFORMS="linux/amd64"
    echo -e "${YELLOW}⚠️  Loading locally, building only for linux/amd64${NC}"
fi

docker buildx build \
    --platform $PLATFORMS \
    --tag $REGISTRY/$IMAGE_NAME:$IMAGE_TAG \
    $BUILD_ARGS \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "📦 Built images:"
    echo "  $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    echo "  Platforms: $PLATFORMS"
    
    if [ "$5" = "--push" ]; then
        echo ""
        echo "🎉 Images pushed to registry!"
        echo ""
        echo "To pull the image:"
        echo "  docker pull $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    else
        echo ""
        echo "🎉 Image loaded into local Docker!"
        echo ""
        echo "To run the image:"
        echo "  docker run -p 80:80 $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    fi
    
    echo ""
    echo "To inspect the manifest:"
    echo "  docker manifest inspect $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
else
    echo ""
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo "✨ Build process complete!"
