#!/bin/bash
# SparkOS Installation Script
# Writes the SparkOS image to a target drive
# Note: This script runs on the host system and uses bash for ${BASH_SOURCE}

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_FILE="$PROJECT_ROOT/sparkos.img"

# Cleanup function
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "ERROR: Installation failed"
    fi
    exit $exit_code
}

# Set trap for cleanup on exit, interrupt, or error
trap cleanup EXIT INT TERM

# Print usage
usage() {
    cat << EOF
SparkOS Installation Script
===========================

Usage: $0 <target_drive>

Arguments:
  target_drive    Block device to install to (e.g., /dev/sdb, /dev/nvme1n1)

Example:
  sudo $0 /dev/sdb
  sudo $0 /dev/nvme1n1

WARNING: This will DESTROY all data on the target drive!

EOF
    exit 1
}

# Print header
echo "SparkOS Installation Script"
echo "==========================="
echo ""

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: This script must be run as root"
    echo "Usage: sudo $0 <target_drive>"
    exit 1
fi

# Check for target drive argument
if [ $# -eq 0 ]; then
    echo "ERROR: No target drive specified"
    echo ""
    usage
fi

TARGET_DRIVE="$1"

# Validate image file exists
if [ ! -f "$IMAGE_FILE" ]; then
    echo "ERROR: SparkOS image not found: $IMAGE_FILE"
    echo ""
    echo "Please build the image first:"
    echo "  make all"
    echo "  sudo make image"
    exit 1
fi

# Validate target drive exists
if [ ! -e "$TARGET_DRIVE" ]; then
    echo "ERROR: Target drive does not exist: $TARGET_DRIVE"
    echo ""
    echo "Available block devices:"
    lsblk -d -o NAME,SIZE,TYPE,MODEL | grep -E '^NAME|disk' || echo "  No block devices found"
    exit 1
fi

# Validate target is a block device
if [ ! -b "$TARGET_DRIVE" ]; then
    echo "ERROR: Target is not a block device: $TARGET_DRIVE"
    echo ""
    echo "Please specify a block device (e.g., /dev/sdb, /dev/nvme1n1)"
    exit 1
fi

# Check for required tool
if ! command -v dd &> /dev/null; then
    echo "ERROR: Required tool 'dd' is not installed"
    exit 1
fi

# Get drive information
DRIVE_SIZE=$(lsblk -b -d -n -o SIZE "$TARGET_DRIVE" 2>/dev/null || echo "unknown")
DRIVE_MODEL=$(lsblk -d -n -o MODEL "$TARGET_DRIVE" 2>/dev/null || echo "unknown")
IMAGE_SIZE=$(stat -c%s "$IMAGE_FILE" 2>/dev/null || echo "unknown")

# Check if target drive is large enough
if [ "$DRIVE_SIZE" != "unknown" ] && [ "$IMAGE_SIZE" != "unknown" ]; then
    if [ "$DRIVE_SIZE" -lt "$IMAGE_SIZE" ]; then
        echo "ERROR: Target drive is too small"
        echo "  Drive size: $(numfmt --to=iec-i --suffix=B $DRIVE_SIZE 2>/dev/null || echo $DRIVE_SIZE)"
        echo "  Image size: $(numfmt --to=iec-i --suffix=B $IMAGE_SIZE 2>/dev/null || echo $IMAGE_SIZE)"
        exit 1
    fi
fi

# Display warning and drive information
echo "⚠️  WARNING: DATA DESTRUCTION IMMINENT ⚠️"
echo ""
echo "This will completely erase all data on the target drive!"
echo ""
echo "Target drive information:"
echo "  Device: $TARGET_DRIVE"
echo "  Model:  $DRIVE_MODEL"
if [ "$DRIVE_SIZE" != "unknown" ]; then
    echo "  Size:   $(numfmt --to=iec-i --suffix=B $DRIVE_SIZE 2>/dev/null || echo $DRIVE_SIZE)"
fi
echo ""
echo "Image information:"
echo "  File: $IMAGE_FILE"
if [ "$IMAGE_SIZE" != "unknown" ]; then
    echo "  Size: $(numfmt --to=iec-i --suffix=B $IMAGE_SIZE 2>/dev/null || echo $IMAGE_SIZE)"
fi
echo ""

# Show mounted partitions on target drive
MOUNTED=$(lsblk -n -o MOUNTPOINT "$TARGET_DRIVE" 2>/dev/null | grep -v '^[[:space:]]*$' || true)
if [ -n "$MOUNTED" ]; then
    echo "WARNING: The following partitions on $TARGET_DRIVE are currently mounted:"
    lsblk -o NAME,MOUNTPOINT "$TARGET_DRIVE"
    echo ""
    echo "Please unmount all partitions before proceeding"
    exit 1
fi

# Require user confirmation
echo "Are you absolutely sure you want to proceed?"
echo -n "Type 'YES' (in all caps) to confirm: "
read CONFIRMATION

if [ "$CONFIRMATION" != "YES" ]; then
    echo ""
    echo "Installation cancelled by user"
    exit 0
fi

echo ""
echo "Starting installation..."
echo ""

# Unmount any partitions (just to be safe)
# Use lsblk to get actual partition names (works for all device types including NVMe)
PARTITIONS=$(lsblk -ln -o NAME "$TARGET_DRIVE" 2>/dev/null | tail -n +2 | sed 's|^|/dev/|' || true)
if [ -n "$PARTITIONS" ]; then
    for part in $PARTITIONS; do
        if mountpoint -q "$part" 2>/dev/null; then
            echo "Unmounting $part..."
            umount "$part" 2>/dev/null || true
        fi
    done
fi

# Write image to drive with progress
echo "Writing SparkOS image to $TARGET_DRIVE..."
echo "This may take several minutes..."
echo ""

if dd if="$IMAGE_FILE" of="$TARGET_DRIVE" bs=4M status=progress conv=fsync 2>&1; then
    echo ""
    echo "Image write completed successfully"
else
    echo ""
    echo "ERROR: Failed to write image to drive"
    exit 1
fi

# Sync to ensure all data is written
echo ""
echo "Syncing data to disk..."
sync

# Verify installation by reading back the first few blocks
echo "Verifying installation..."
VERIFY_BLOCKS=1024
VERIFY_TMP=$(mktemp -t sparkos_verify.XXXXXXXX)
SOURCE_TMP=$(mktemp -t sparkos_source.XXXXXXXX)

# Ensure temp files are cleaned up on exit
trap "rm -f $VERIFY_TMP $SOURCE_TMP; cleanup" EXIT INT TERM

dd if="$TARGET_DRIVE" of="$VERIFY_TMP" bs=512 count=$VERIFY_BLOCKS status=none 2>/dev/null
dd if="$IMAGE_FILE" of="$SOURCE_TMP" bs=512 count=$VERIFY_BLOCKS status=none 2>/dev/null

if cmp -s "$VERIFY_TMP" "$SOURCE_TMP"; then
    echo "✓ Verification successful - installation completed!"
else
    echo "✗ Verification failed - installation may be corrupted"
    rm -f "$VERIFY_TMP" "$SOURCE_TMP"
    exit 1
fi

# Clean up verification files
rm -f "$VERIFY_TMP" "$SOURCE_TMP"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUCCESS! SparkOS has been installed to $TARGET_DRIVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You can now:"
echo "  1. Safely remove the drive"
echo "  2. Boot from the drive"
echo "  3. Log in as user 'spark'"
echo ""
echo "First boot instructions:"
echo "  - The system will boot with wired networking enabled"
echo "  - Default user: spark (full sudo access)"
echo "  - Run ~/clone-sparkos.sh to install spark CLI"
echo "  - Use spark CLI to configure WiFi and system"
echo ""
