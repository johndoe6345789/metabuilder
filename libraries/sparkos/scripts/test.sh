#!/bin/sh
echo "SparkOS Docker Test Environment"
echo "================================"
echo ""

echo "Verifying SparkOS init binary..."
echo "--------------------------------"
if [ -f /sparkos/rootfs/sbin/init ]; then
    echo "✓ Init binary exists"
    ls -lh /sparkos/rootfs/sbin/init
    echo ""
    echo "File type:"
    if command -v file >/dev/null 2>&1; then
        file /sparkos/rootfs/sbin/init
    else
        echo "  (file command not available)"
    fi
    echo ""
    echo "Dependencies:"
    ldd /sparkos/rootfs/sbin/init 2>&1 || echo "  Static binary (no dependencies)"
else
    echo "✗ Init binary not found!"
    exit 1
fi

echo ""
echo "Root filesystem structure:"
echo "--------------------------"
ls -la /sparkos/rootfs/
echo ""
echo "================================"
echo "✓ SparkOS is ready for testing!"
echo "================================"
echo ""
echo "Summary:"
echo "  - Init: Custom SparkOS init system (no external dependencies)"
echo "  - Architecture: GUI-only, no CLI/shell"
echo "  - Network: Direct C implementation via ioctl"
echo "  - Philosophy: Pure GUI experience, network-first"
echo ""
echo "Note: SparkOS has no CLI tools (no busybox, no shell)"
echo "      All functionality is provided through the Qt6 GUI"
echo ""
echo "To test the init system:"
echo "  docker run --rm <image> /sparkos/rootfs/sbin/init"