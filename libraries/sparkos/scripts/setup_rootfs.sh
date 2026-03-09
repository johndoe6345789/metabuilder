#!/bin/bash
# SparkOS Setup Script
# Sets up a minimal rootfs for GUI-only SparkOS
# Note: This script runs on the host system and uses bash for ${BASH_SOURCE}

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOTFS_DIR="$PROJECT_ROOT/rootfs"

echo "SparkOS Root Filesystem Setup"
echo "=============================="
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$ROOTFS_DIR"/{sbin,etc,proc,sys,dev,tmp,usr/{bin,sbin,lib,lib64},var,root}
mkdir -p "$ROOTFS_DIR/var"/{log,run}

# Set permissions
chmod 1777 "$ROOTFS_DIR/tmp"
chmod 700 "$ROOTFS_DIR/root"

# Create basic config files
echo "Creating configuration files..."

# /etc/hostname
echo "sparkos" > "$ROOTFS_DIR/etc/hostname"

# /etc/hosts
cat > "$ROOTFS_DIR/etc/hosts" << 'EOF'
127.0.0.1   localhost
127.0.1.1   sparkos
::1         localhost ip6-localhost ip6-loopback
EOF

# /etc/fstab
cat > "$ROOTFS_DIR/etc/fstab" << 'EOF'
# <file system> <mount point> <type> <options> <dump> <pass>
proc            /proc         proc    defaults          0 0
sysfs           /sys          sysfs   defaults          0 0
devtmpfs        /dev          devtmpfs defaults         0 0
tmpfs           /tmp          tmpfs   defaults          0 0
EOF

# /etc/resolv.conf - DNS configuration (managed by Qt6 GUI)
cat > "$ROOTFS_DIR/etc/resolv.conf" << 'EOF'
# SparkOS DNS Configuration
# Managed by Qt6 GUI NetworkManager
# Fallback to public DNS servers
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
nameserver 1.0.0.1
EOF

# Create README
cat > "$ROOTFS_DIR/README.txt" << 'EOF'
SparkOS Root Filesystem
=======================

This is the root filesystem for SparkOS, a GUI-only Linux distribution.

SparkOS Philosophy:
  - GUI-Only: No CLI tools, no shell, no Unix utilities
  - Network-First: Networking integrated into Qt6 GUI
  - Direct Kernel Interface: Qt6 communicates directly with Linux kernel
  - No Unix Baggage: No users, groups, passwords, or authentication

Minimal System:
  - Linux Kernel (with networking and framebuffer support)
  - SparkOS Init System (completely self-contained, no dependencies)
  - Qt6 GUI Application (all user interaction)

Directory Structure:
  /sbin             - Init binary only
  /etc              - Minimal configuration files
  /proc, /sys, /dev - Kernel interfaces
  /tmp              - Temporary files
  /usr              - Qt6 GUI application and libraries
  /var              - Variable data (overlay mount)
  /root             - Root home directory

Network Configuration:
  - Managed entirely through Qt6 GUI
  - Init brings up interfaces via direct ioctl calls
  - DHCP and network management handled by Qt6 NetworkManager
  - /etc/resolv.conf provides fallback DNS servers

Boot Process:
  1. Linux kernel loads
  2. Init (PID 1) mounts filesystems
  3. Init brings up network interfaces
  4. Init spawns Qt6 GUI application
  5. All user interaction through GUI

Note: This is a minimal, GUI-only system.
      No shell, no CLI tools, no busybox.
      All functionality is provided through the Qt6 GUI application.
EOF

echo ""
echo "Root filesystem structure created at: $ROOTFS_DIR"
echo ""
echo "SparkOS Configuration:"
echo "  - Architecture: GUI-only, no CLI"
echo "  - Init: Self-contained, no external dependencies"
echo "  - Network: Direct C implementation via ioctl"
echo "  - User Experience: Pure Qt6 GUI"
echo ""
echo "Next steps:"
echo "  1. Build init: make init"
echo "  2. Install init: make install"
echo "  3. Build Qt6 GUI: make gui"
echo "  4. Create bootable image: sudo make image"
echo ""
echo "Philosophy:"
echo "  No busybox, no shell, no CLI tools"
echo "  Everything is GUI-driven through Qt6"
