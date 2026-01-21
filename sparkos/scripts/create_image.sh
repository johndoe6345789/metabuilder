#!/bin/bash
# SparkOS Image Creation Script
# Creates a bootable dd-able disk image

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_FILE="$PROJECT_ROOT/sparkos.img"
IMAGE_SIZE="512M"
MOUNT_POINT="/tmp/sparkos_mount"
ROOTFS_DIR="$PROJECT_ROOT/rootfs"
LOOP_DEV=""

# Cleanup function
cleanup() {
    local exit_code=$?
    echo "Cleaning up..."
    
    # Unmount if mounted
    if mountpoint -q "$MOUNT_POINT" 2>/dev/null; then
        umount "$MOUNT_POINT" 2>/dev/null || true
    fi
    
    # Remove mount point
    if [ -d "$MOUNT_POINT" ]; then
        rmdir "$MOUNT_POINT" 2>/dev/null || true
    fi
    
    # Detach loop device
    if [ -n "$LOOP_DEV" ] && losetup "$LOOP_DEV" &>/dev/null; then
        losetup -d "$LOOP_DEV" 2>/dev/null || true
    fi
    
    if [ $exit_code -ne 0 ]; then
        echo "ERROR: Image creation failed"
    fi
    
    exit $exit_code
}

# Set trap for cleanup on exit, interrupt, or error
trap cleanup EXIT INT TERM

echo "SparkOS Image Builder"
echo "====================="
echo ""

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: This script must be run as root"
    echo "Usage: sudo $0"
    exit 1
fi

# Check for required tools
REQUIRED_TOOLS="dd losetup mkfs.ext4 syslinux"
for tool in $REQUIRED_TOOLS; do
    if ! command -v "$tool" &> /dev/null; then
        echo "ERROR: Required tool '$tool' is not installed"
        exit 1
    fi
done

echo "Creating disk image ($IMAGE_SIZE)..."
dd if=/dev/zero of="$IMAGE_FILE" bs=1M count=512 status=progress

echo "Setting up loop device..."
LOOP_DEV=$(losetup -f)
losetup "$LOOP_DEV" "$IMAGE_FILE"

echo "Creating partition table..."
parted -s "$LOOP_DEV" mklabel msdos
parted -s "$LOOP_DEV" mkpart primary ext4 1MiB 100%
parted -s "$LOOP_DEV" set 1 boot on

# Reload partition table
partprobe "$LOOP_DEV" 2>/dev/null || true
sleep 1

# Get partition device
PART_DEV="${LOOP_DEV}p1"
if [ ! -e "$PART_DEV" ]; then
    PART_DEV="${LOOP_DEV}1"
fi

echo "Creating ext4 filesystem..."
mkfs.ext4 -F "$PART_DEV"

echo "Mounting filesystem..."
mkdir -p "$MOUNT_POINT"
mount "$PART_DEV" "$MOUNT_POINT"

echo "Copying rootfs..."
if [ -d "$ROOTFS_DIR" ]; then
    cp -a "$ROOTFS_DIR"/* "$MOUNT_POINT/"
else
    echo "WARNING: rootfs directory not found, creating minimal structure"
    mkdir -p "$MOUNT_POINT"/{bin,sbin,etc,proc,sys,dev,tmp,usr/{bin,sbin,lib},var,root,home}
fi

echo "Installing bootloader..."
mkdir -p "$MOUNT_POINT/boot/syslinux"

# Create syslinux config
cat > "$MOUNT_POINT/boot/syslinux/syslinux.cfg" << 'EOF'
DEFAULT linux
PROMPT 0
TIMEOUT 50

LABEL linux
    SAY Booting SparkOS...
    KERNEL /boot/vmlinuz
    APPEND ro root=/dev/sda1 init=/sbin/init console=tty1
EOF

# Install syslinux
syslinux --install "$PART_DEV"

# Install MBR
dd if=/usr/lib/syslinux/mbr/mbr.bin of="$LOOP_DEV" bs=440 count=1 conv=notrunc 2>/dev/null || \
    dd if=/usr/share/syslinux/mbr.bin of="$LOOP_DEV" bs=440 count=1 conv=notrunc 2>/dev/null || \
    echo "WARNING: Could not install MBR, you may need to do this manually"

echo ""
echo "SUCCESS! Bootable image created: $IMAGE_FILE"
echo ""
echo "To write to a USB drive:"
echo "  sudo dd if=$IMAGE_FILE of=/dev/sdX bs=4M status=progress"
echo ""
echo "WARNING: Replace /dev/sdX with your actual USB drive device"
echo "         This will DESTROY all data on the target drive!"
