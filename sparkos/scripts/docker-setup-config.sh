#!/bin/sh
# Set up basic configuration files for SparkOS

set -e

# Create hostname
echo "sparkos" > /sparkos/rootfs/etc/hostname

# Create hosts file
echo "127.0.0.1   localhost" > /sparkos/rootfs/etc/hosts
echo "127.0.1.1   sparkos" >> /sparkos/rootfs/etc/hosts

# Create passwd file
echo "root:x:0:0:root:/root:/bin/sh" > /sparkos/rootfs/etc/passwd
echo "spark:x:1000:1000:SparkOS User:/home/spark:/bin/sh" >> /sparkos/rootfs/etc/passwd

# Create group file
echo "root:x:0:" > /sparkos/rootfs/etc/group
echo "spark:x:1000:" >> /sparkos/rootfs/etc/group
