#!/bin/bash
# SparkOS Docker-based Release Builder
# Build release artifacts using Docker (no root required)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASE_DIR="$PROJECT_ROOT/release"
VERSION="${1:-dev}"

echo "SparkOS Docker Release Builder"
echo "=============================="
echo ""
echo "Version: $VERSION"
echo ""

# Clean previous release
if [ -d "$RELEASE_DIR" ]; then
    echo "Cleaning previous release..."
    rm -rf "$RELEASE_DIR"
fi

mkdir -p "$RELEASE_DIR"

# Build using Docker (multi-stage build)
echo "Building init binary using Docker..."
docker build -t sparkos:build-temp --target builder "$PROJECT_ROOT"

# Extract the built binary
echo "Extracting init binary..."
CONTAINER_ID=$(docker create sparkos:build-temp)
docker cp "$CONTAINER_ID:/build/init" "$RELEASE_DIR/init"
docker rm "$CONTAINER_ID" > /dev/null

# Verify the binary
echo ""
echo "Verifying init binary..."
if [ ! -f "$RELEASE_DIR/init" ]; then
    echo "ERROR: Failed to extract init binary"
    exit 1
fi

ls -lh "$RELEASE_DIR/init"
file "$RELEASE_DIR/init"

# Create release package structure
echo ""
echo "Creating release package..."
mkdir -p "$RELEASE_DIR/sparkos"

# Copy compiled binary
cp "$RELEASE_DIR/init" "$RELEASE_DIR/sparkos/"

# Copy essential files
cp "$PROJECT_ROOT/README.md" "$RELEASE_DIR/sparkos/"
cp "$PROJECT_ROOT/LICENSE" "$RELEASE_DIR/sparkos/"
cp "$PROJECT_ROOT/ARCHITECTURE.md" "$RELEASE_DIR/sparkos/"
cp "$PROJECT_ROOT/CONTRIBUTING.md" "$RELEASE_DIR/sparkos/"
cp "$PROJECT_ROOT/Makefile" "$RELEASE_DIR/sparkos/"
cp "$PROJECT_ROOT/Dockerfile" "$RELEASE_DIR/sparkos/"

# Copy source for reference
cp -r "$PROJECT_ROOT/src" "$RELEASE_DIR/sparkos/"

# Copy scripts
cp -r "$PROJECT_ROOT/scripts" "$RELEASE_DIR/sparkos/"

# Copy config
cp -r "$PROJECT_ROOT/config" "$RELEASE_DIR/sparkos/"

# Copy rootfs structure (without generated content)
mkdir -p "$RELEASE_DIR/sparkos/rootfs"
for dir in etc root home; do
    if [ -d "$PROJECT_ROOT/rootfs/$dir" ]; then
        cp -r "$PROJECT_ROOT/rootfs/$dir" "$RELEASE_DIR/sparkos/rootfs/"
    fi
done

# Create README for the release
cat > "$RELEASE_DIR/sparkos/RELEASE_README.md" << 'EOF'
# SparkOS Release Package

This package contains the compiled SparkOS init system and all necessary files to run or build SparkOS.

## Contents

- `init` - The compiled init binary (statically linked)
- `src/` - Source code for the init system
- `scripts/` - Build and setup scripts
- `config/` - Configuration files
- `rootfs/` - Root filesystem structure
- `Dockerfile` - Docker image definition
- `Makefile` - Build system
- Documentation files (README.md, ARCHITECTURE.md, etc.)

## Quick Start

### Using the Pre-built Binary

The `init` binary is already compiled and ready to use:

```bash
# Copy to your rootfs
cp init /path/to/your/rootfs/sbin/init
chmod 755 /path/to/your/rootfs/sbin/init
```

### Using Docker

The easiest way to test SparkOS:

```bash
# Build the Docker image
docker build -t sparkos .

# Run the test environment
docker run --rm sparkos
```

### Rebuilding from Source

If you need to rebuild:

```bash
# Build the init system
make init

# Install to rootfs
make install
```

## Using Docker for Releases

Build release artifacts without needing root or special tools:

```bash
# Build release package
./scripts/docker-release.sh v1.0.0

# The release package will be in release/sparkos-release.zip
```

## System Requirements

- Linux system with kernel 3.x or later with framebuffer support
- Qt6 runtime libraries for GUI
- For building: Docker or GCC compiler and Make

## Documentation

See README.md for complete documentation, including:
- Building instructions
- Docker usage
- Network configuration
- Development guidelines

## Support

For issues and questions, visit: https://github.com/johndoe6345789/SparkOS
EOF

# Create release archive
echo ""
echo "Creating release archive..."
cd "$RELEASE_DIR"
zip -q -r "sparkos-release.zip" sparkos/
cd "$PROJECT_ROOT"

echo ""
echo "SUCCESS! Release package created:"
echo "  Location: $RELEASE_DIR/sparkos-release.zip"
echo "  Size: $(du -h "$RELEASE_DIR/sparkos-release.zip" | cut -f1)"
echo ""
echo "Contents:"
ls -lh "$RELEASE_DIR/sparkos-release.zip"
echo ""
echo "To verify the contents:"
echo "  unzip -l $RELEASE_DIR/sparkos-release.zip | head -40"
echo ""
echo "To test the Docker image:"
echo "  docker build -t sparkos:$VERSION ."
echo "  docker run --rm sparkos:$VERSION"
