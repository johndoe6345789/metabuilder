SparkOS UEFI-Bootable Disk Image
==================================

This package contains a UEFI-bootable disk image with SparkOS.

Files:
- sparkos.img.gz - Compressed UEFI-bootable disk image (~1GB)

What's Included:
---------------
✓ GPT partition table
✓ EFI System Partition (ESP) with FAT32 filesystem
✓ GRUB UEFI bootloader
✓ Linux kernel
✓ SparkOS init system (self-contained, no dependencies)
✓ Qt6 GUI application
✓ Minimal filesystem structure

Boot Support:
------------
✓ UEFI boot (x86_64 systems)
✓ Automatic boot after 3 seconds
✓ Direct boot to Qt6 GUI (no CLI)
✓ Console on tty1 (for debugging only)

Quick Start:
-----------

1. Decompress the image:
   gunzip sparkos.img.gz

2. Write to USB drive (Linux - BE CAREFUL!):
   sudo dd if=sparkos.img of=/dev/sdX bs=4M status=progress oflag=sync
   
   WARNING: Replace /dev/sdX with your actual USB drive device.
            This will DESTROY all data on the target drive!

3. Boot from USB:
   - Insert the USB drive into a UEFI-capable system
   - Enter BIOS/UEFI settings (usually F2, F12, DEL, or ESC at boot)
   - Select the USB drive as boot device
   - SparkOS should boot automatically

Advanced - Inspect Partitions:
------------------------------

To mount and inspect the partitions:

# Set up loop device
sudo losetup -fP --show sparkos.img
# Note the loop device name (e.g., /dev/loop0)

# Mount ESP (EFI System Partition)
sudo mount /dev/loop0p1 /mnt
ls -la /mnt/EFI
sudo umount /mnt

# Mount root partition
sudo mount /dev/loop0p2 /mnt
ls -la /mnt
sudo umount /mnt

# Cleanup
sudo losetup -d /dev/loop0

Documentation:
-------------
See the full documentation at:
https://github.com/johndoe6345789/SparkOS

Support:
-------
For issues and questions, visit:
https://github.com/johndoe6345789/SparkOS/issues
