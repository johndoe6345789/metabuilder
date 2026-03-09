# SparkOS Release Package

This package contains the compiled SparkOS init system and all necessary files to run or build SparkOS.

## Contents

- `init` - The compiled init binary (statically linked)
- `src/` - Source code for the init system
- `scripts/` - Build and setup scripts
- `config/` - Configuration files
- `rootfs/` - Root filesystem structure
- `Makefile` - Build system
- Documentation files (README.md, ARCHITECTURE.md, etc.)

## Quick Start

### Using the Pre-built Binary

The `init` binary is already compiled and ready to use:

```bash
# Copy to your rootfs
cp init /path/to/your/rootfs/sbin/init
chmod 755 /path/to/your/rootfs/sbin/init
```

### Rebuilding from Source

If you need to rebuild:

```bash
# Build the init system
make init

# Install to rootfs
make install
```

### Creating a Bootable System

Follow the instructions in README.md to create a complete bootable system.

## System Requirements

- Linux system with kernel 3.x or later with framebuffer support
- Qt6 runtime libraries for GUI
- For building: GCC compiler, Make

## Documentation

See README.md for complete documentation, including:
- Building instructions
- Creating bootable images
- Network configuration
- Development guidelines

## Support

For issues and questions, visit: https://github.com/johndoe6345789/SparkOS
