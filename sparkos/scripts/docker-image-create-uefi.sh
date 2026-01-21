#!/bin/bash
# Create UEFI-bootable SparkOS image with GPT partition table
# This version uses mtools and mke2fs to avoid needing loop devices

set -e

# Configuration
ESP_LABEL="SPARKOSEFI"
ROOT_LABEL="SparkOS"

mkdir -p /output /staging/esp /staging/root

echo "=== Creating UEFI-bootable SparkOS image with GRUB ==="

# Prepare ESP contents first
echo "Preparing ESP contents..."
mkdir -p /staging/esp/EFI/BOOT
mkdir -p /staging/esp/boot/grub

# Create minimal embedded GRUB configuration from template
sed "s/@ESP_LABEL@/$ESP_LABEL/g" /build/config/grub-embedded.cfg.in > /tmp/embedded_grub.cfg

# Create GRUB EFI binary using grub-mkstandalone with embedded bootstrap config
# Include essential modules for better hardware compatibility
grub-mkstandalone \
    --format=x86_64-efi \
    --output=/staging/esp/EFI/BOOT/BOOTX64.EFI \
    --locales="" \
    --fonts="" \
    --modules="part_gpt part_msdos fat ext2 normal linux \
               all_video video_bochs video_cirrus gfxterm \
               search search_label search_fs_uuid" \
    "boot/grub/grub.cfg=/tmp/embedded_grub.cfg"

# Find the kernel
KERNEL_PATH=$(find /kernel/boot -name "vmlinuz-*" | head -1)
KERNEL_VERSION=$(basename $KERNEL_PATH | sed 's/vmlinuz-//')
INITRD_PATH=$(find /kernel/boot -name "initrd.img-*" | head -1)

# Copy kernel and initrd to staging
echo "Copying kernel to staging..."
cp $KERNEL_PATH /staging/esp/boot/vmlinuz

# Ensure initrd exists (required for booting)
if [ ! -f "$INITRD_PATH" ]; then
    echo "ERROR: initrd not found. The kernel requires an initrd to boot."
    echo "Expected to find: initrd.img-* in /kernel/boot/"
    exit 1
fi
echo "Copying initrd to staging..."
cp $INITRD_PATH /staging/esp/boot/initrd.img

# Create GRUB configuration from template
sed "s/@ROOT_LABEL@/$ROOT_LABEL/g" /build/config/grub.cfg.in > /staging/esp/boot/grub/grub.cfg

# Prepare root filesystem contents
echo "Preparing root filesystem..."
mkdir -p /staging/root/{bin,sbin,etc,proc,sys,dev,tmp,usr/{bin,sbin,lib,lib64},var/{log,run},root,home/spark,boot}

# Install SparkOS init
cp /build/init /staging/root/sbin/init
chmod 755 /staging/root/sbin/init

# Create system configuration files
echo "sparkos" > /staging/root/etc/hostname
echo "127.0.0.1   localhost" > /staging/root/etc/hosts
echo "127.0.1.1   sparkos" >> /staging/root/etc/hosts

# Copy README to root partition
cp /build/config/image-readme.txt /staging/root/README.txt

# Create 1GB disk image
echo "Creating disk image..."
dd if=/dev/zero of=/output/sparkos.img bs=1M count=1024

# Create GPT partition table using sgdisk
echo "Creating GPT partition table..."
sgdisk -Z /output/sparkos.img 2>/dev/null || true
sgdisk -n 1:2048:411647 -t 1:ef00 -c 1:"EFI System" /output/sparkos.img
sgdisk -n 2:411648:0 -t 2:8300 -c 2:"Linux filesystem" /output/sparkos.img

# Extract partition regions using dd
echo "Extracting partition regions..."
dd if=/output/sparkos.img of=/tmp/esp.img bs=512 skip=2048 count=409600 2>/dev/null

# Calculate exact size for root partition
ROOT_START=411648
ROOT_END=$(sgdisk -p /output/sparkos.img 2>/dev/null | grep "^   2" | awk '{print $3}')
ROOT_SIZE=$((ROOT_END - ROOT_START + 1))
echo "Root partition: start=$ROOT_START, end=$ROOT_END, size=$ROOT_SIZE sectors"

dd if=/output/sparkos.img of=/tmp/root.img bs=512 skip=$ROOT_START count=$ROOT_SIZE 2>/dev/null

# Format ESP partition (FAT32)
echo "Formatting EFI System Partition (FAT32)..."
mkfs.vfat -F 32 -n "$ESP_LABEL" /tmp/esp.img >/dev/null

# Populate ESP using mtools (no mount needed!)
echo "Populating ESP with bootloader and kernel..."
export MTOOLS_SKIP_CHECK=1
mmd -i /tmp/esp.img ::/EFI
mmd -i /tmp/esp.img ::/EFI/BOOT
mmd -i /tmp/esp.img ::/boot
mmd -i /tmp/esp.img ::/boot/grub
mcopy -i /tmp/esp.img /staging/esp/EFI/BOOT/BOOTX64.EFI ::/EFI/BOOT/
mcopy -i /tmp/esp.img /staging/esp/boot/vmlinuz ::/boot/
mcopy -i /tmp/esp.img /staging/esp/boot/initrd.img ::/boot/
mcopy -i /tmp/esp.img /staging/esp/boot/grub/grub.cfg ::/boot/grub/

# Format root partition (ext4) with directory contents (no mount needed!)
echo "Formatting root partition (ext4) and populating..."
mke2fs -t ext4 -L "$ROOT_LABEL" -d /staging/root /tmp/root.img >/dev/null 2>&1

# Write partitions back to image
echo "Writing partitions to image..."
dd if=/tmp/esp.img of=/output/sparkos.img bs=512 seek=2048 count=409600 conv=notrunc 2>/dev/null
dd if=/tmp/root.img of=/output/sparkos.img bs=512 seek=$ROOT_START count=$ROOT_SIZE conv=notrunc 2>/dev/null

# Clean up temporary files
rm -f /tmp/esp.img /tmp/root.img

# Finalize
echo "Finalizing image..."
sync

# Compress the image
echo "Compressing image..."
gzip -9 /output/sparkos.img
echo "UEFI-bootable image created: /output/sparkos.img.gz"
