#!/bin/bash
# Build SparkOS disk image using Docker
# This script builds a .img file without requiring root on the host

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/release"

echo "SparkOS Disk Image Builder (Docker)"
echo "===================================="
echo ""

# Clean previous build
if [ -f "$OUTPUT_DIR/sparkos.img.gz" ]; then
    echo "Cleaning previous image..."
    rm -f "$OUTPUT_DIR/sparkos.img.gz"
fi

mkdir -p "$OUTPUT_DIR"

echo "Building disk image using Docker..."
echo "This may take a few minutes..."
echo ""

# Build the image builder container
cd "$PROJECT_ROOT"
docker buildx build \
    --file Dockerfile.image \
    --target image-builder \
    --tag sparkos:image-builder \
    --load \
    .

# Extract the image
echo ""
echo "Extracting disk image..."
CONTAINER_ID=$(docker create sparkos:image-builder)
docker cp "$CONTAINER_ID:/output/sparkos.img.gz" "$OUTPUT_DIR/sparkos.img.gz"
docker rm "$CONTAINER_ID" > /dev/null

echo ""
echo "SUCCESS! Disk image created:"
echo "  Location: $OUTPUT_DIR/sparkos.img.gz"
echo "  Size: $(du -h "$OUTPUT_DIR/sparkos.img.gz" | cut -f1)"
echo ""

# Show decompressed size
echo "Decompressed size:"
DECOMPRESSED_SIZE=$(gunzip -l "$OUTPUT_DIR/sparkos.img.gz" | tail -1 | awk '{print $2}')
echo "  $(numfmt --to=iec-i --suffix=B $DECOMPRESSED_SIZE)"
echo ""

echo "To write to a USB drive:"
echo "  gunzip $OUTPUT_DIR/sparkos.img.gz"
echo "  sudo dd if=$OUTPUT_DIR/sparkos.img of=/dev/sdX bs=4M status=progress"
echo ""
echo "WARNING: Replace /dev/sdX with your actual USB device!"
echo "         This will DESTROY all data on the target drive!"
echo ""

echo "To inspect the image:"
echo "  gunzip -c $OUTPUT_DIR/sparkos.img.gz > /tmp/sparkos.img"
echo "  sudo mount -o loop /tmp/sparkos.img /mnt"
echo "  ls -la /mnt"
echo "  sudo umount /mnt"
