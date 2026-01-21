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
