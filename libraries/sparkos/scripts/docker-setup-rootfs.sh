#!/bin/sh
# Create minimal rootfs structure for SparkOS

set -e

# Create minimal rootfs structure
mkdir -p /sparkos/rootfs/bin \
    /sparkos/rootfs/sbin \
    /sparkos/rootfs/etc \
    /sparkos/rootfs/proc \
    /sparkos/rootfs/sys \
    /sparkos/rootfs/dev \
    /sparkos/rootfs/tmp \
    /sparkos/rootfs/usr/bin \
    /sparkos/rootfs/usr/sbin \
    /sparkos/rootfs/usr/lib \
    /sparkos/rootfs/var/log \
    /sparkos/rootfs/var/run \
    /sparkos/rootfs/root \
    /sparkos/rootfs/home/spark

# Set proper permissions
chmod 1777 /sparkos/rootfs/tmp
chmod 700 /sparkos/rootfs/root
chmod 755 /sparkos/rootfs/home/spark
