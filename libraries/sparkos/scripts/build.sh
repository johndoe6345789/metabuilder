#!/bin/bash
# Quick build script for SparkOS development
# Note: This script runs on the host system and uses bash for ${BASH_SOURCE}

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "SparkOS Quick Build"
echo "==================="
echo ""

# Build init
echo "Building init system..."
make init

# Setup rootfs structure
echo ""
echo "Setting up root filesystem..."
./scripts/setup_rootfs.sh

# Install init
echo ""
echo "Installing init to rootfs..."
make install

echo ""
echo "Build complete!"
echo ""
echo "Next steps to create a full bootable system:"
echo "  1. Build Qt6 GUI: make gui"
echo "  2. Add a Linux kernel to rootfs/boot/vmlinuz"
echo "  3. Run: sudo make image"
echo ""
echo "Philosophy: No CLI tools, GUI-only experience"
echo ""
