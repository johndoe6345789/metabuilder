#!/bin/bash
# Download a minimal Linux kernel for UEFI image

set -e

echo "=== Downloading Linux kernel from Ubuntu repositories ==="

mkdir -p /kernel
apt-get update

# Install initramfs-tools for generating initrd
echo "Installing initramfs-tools..."
apt-get install -y initramfs-tools

# Get the actual kernel package name (not the metapackage)
echo "Finding latest kernel package..."
KERNEL_PKG=$(apt-cache depends linux-image-generic | grep -E 'Depends.*linux-image-[0-9]' | head -1 | awk '{print $2}')

if [ -z "$KERNEL_PKG" ]; then
    echo "ERROR: Could not determine kernel package name"
    exit 1
fi

echo "Downloading kernel package: $KERNEL_PKG"
apt-get download "$KERNEL_PKG"

# Extract the kernel package to /kernel
echo "Extracting kernel..."
dpkg -x "${KERNEL_PKG}"*.deb /kernel

# Verify kernel was extracted
if [ ! -d /kernel/boot ]; then
    echo "ERROR: Kernel boot directory not found after extraction"
    exit 1
fi

KERNEL_FILE=$(find /kernel/boot -name "vmlinuz-*" | head -1)
if [ -z "$KERNEL_FILE" ]; then
    echo "ERROR: No kernel image found"
    exit 1
fi

echo "Kernel extracted successfully: $KERNEL_FILE"

# Extract kernel version from the kernel filename
KERNEL_VERSION=$(basename "$KERNEL_FILE" | sed 's/vmlinuz-//')
echo "Kernel version: $KERNEL_VERSION"

# Copy kernel modules to system location so mkinitramfs can find them
echo "Copying kernel modules to system location..."
if [ -d "/kernel/lib/modules/${KERNEL_VERSION}" ]; then
    cp -r "/kernel/lib/modules/${KERNEL_VERSION}" /lib/modules/
else
    echo "WARNING: No modules found for kernel ${KERNEL_VERSION}"
fi

# Generate initrd using mkinitramfs
echo "Generating initrd for kernel version $KERNEL_VERSION..."
mkinitramfs -o "/kernel/boot/initrd.img-${KERNEL_VERSION}" "${KERNEL_VERSION}"

# Verify initrd was created
if [ ! -f "/kernel/boot/initrd.img-${KERNEL_VERSION}" ]; then
    echo "ERROR: Failed to generate initrd"
    exit 1
fi

echo "Initrd generated successfully: /kernel/boot/initrd.img-${KERNEL_VERSION}"
ls -lh /kernel/boot/

# Clean up
rm -rf /var/lib/apt/lists/* "${KERNEL_PKG}"*.deb
