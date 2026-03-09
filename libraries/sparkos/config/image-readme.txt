SparkOS UEFI-Bootable Image

This is a UEFI-bootable disk image with:
- GPT partition table
- EFI System Partition (ESP) with FAT32 filesystem
- GRUB UEFI bootloader
- Linux kernel
- SparkOS init system (self-contained, no external dependencies)
- Qt6 GUI application

The image can be written to a USB drive and booted on UEFI systems:
  sudo dd if=sparkos.img of=/dev/sdX bs=4M status=progress
  sudo sync

Boot options:
- UEFI boot support (tested on x86_64 systems)
- Automatic boot after 3 seconds
- Direct boot to Qt6 GUI (no CLI)
- Console on tty1 (for debugging only)

Philosophy: GUI-only, no CLI tools, network-first

For more information, see: https://github.com/johndoe6345789/SparkOS
