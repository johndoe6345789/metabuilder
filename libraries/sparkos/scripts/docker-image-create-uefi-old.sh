#!/bin/bash
# Create UEFI-bootable SparkOS image with GPT partition table

set -e

mkdir -p /output /staging/esp /staging/root

echo "=== Creating UEFI-bootable SparkOS image with GRUB ==="

# Create 1GB disk image (larger for kernel + bootloader)
dd if=/dev/zero of=/output/sparkos.img bs=1M count=1024

# Create GPT partition table
echo "Creating GPT partition table..."
parted -s /output/sparkos.img mklabel gpt

# Create EFI System Partition (ESP) - 200MB, FAT32
echo "Creating EFI System Partition..."
parted -s /output/sparkos.img mkpart ESP fat32 1MiB 201MiB
parted -s /output/sparkos.img set 1 esp on

# Create root partition - remaining space, ext4
echo "Creating root partition..."
parted -s /output/sparkos.img mkpart primary ext4 201MiB 100%

# Use libguestfs to format and populate partitions without loop devices
echo "Formatting partitions using guestfish..."
guestfish -a /output/sparkos.img <<'EOF'
run
mkfs vfat /dev/sda1 label:SPARKOSEFI
mkfs ext4 /dev/sda2 label:SparkOS
mount /dev/sda2 /
mkdir-p /boot
EOF

# Prepare ESP contents
echo "Preparing ESP contents..."

# Prepare ESP contents
echo "Preparing ESP contents..."
mkdir -p /staging/esp/EFI/BOOT
mkdir -p /staging/esp/boot/grub

# Create GRUB EFI binary using grub-mkstandalone
grub-mkstandalone \
    --format=x86_64-efi \
    --output=/staging/esp/EFI/BOOT/BOOTX64.EFI \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=/dev/null"

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

# Create GRUB configuration
printf '%s\n' \
    'set timeout=3' \
    'set default=0' \
    '' \
    'menuentry "SparkOS" {' \
    '    linux /boot/vmlinuz root=LABEL=SparkOS rw init=/sbin/init console=tty1 quiet' \
    '    initrd /boot/initrd.img' \
    '}' \
    > /staging/esp/boot/grub/grub.cfg

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

# Copy ESP contents to the image
echo "Populating EFI System Partition..."
guestfish -a /output/sparkos.img <<'EOF'
run
mount /dev/sda1 /
mkdir-p /EFI
mkdir-p /EFI/BOOT
mkdir-p /boot
mkdir-p /boot/grub
EOF

# Copy files using guestfish
echo "Copying bootloader files..."
guestfish -a /output/sparkos.img -m /dev/sda1 <<EOF
copy-in /staging/esp/EFI/BOOT/BOOTX64.EFI /EFI/BOOT/
copy-in /staging/esp/boot/vmlinuz /boot/
copy-in /staging/esp/boot/initrd.img /boot/
EOF

guestfish -a /output/sparkos.img -m /dev/sda1 <<EOF
copy-in /staging/esp/boot/grub/grub.cfg /boot/grub/
EOF

# Copy root filesystem contents to the image
echo "Populating root filesystem..."
guestfish -a /output/sparkos.img -m /dev/sda2 <<'EOF'
copy-in /staging/root/bin /
copy-in /staging/root/sbin /
copy-in /staging/root/etc /
copy-in /staging/root/usr /
copy-in /staging/root/var /
copy-in /staging/root/root /
copy-in /staging/root/home /
copy-in /staging/root/README.txt /
mkdir-p /proc
mkdir-p /sys
mkdir-p /dev
mkdir-p /tmp
mkdir-p /boot
chmod 0755 /tmp
chmod 0755 /sbin/init
chmod 0755 /bin/busybox
EOF

# Finalize
echo "Finalizing image..."
sync

# Compress the image
echo "Compressing image..."
gzip -9 /output/sparkos.img
echo "UEFI-bootable image created: /output/sparkos.img.gz"
