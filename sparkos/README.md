# SparkOS

A revolutionary operating system that ditches Unix conventions for a modern, network-first approach. SparkOS features:

- **Direct Kernel Interface**: Qt6 GUI communicates directly with Linux kernel, bypassing Unix layers
- **Linux Driver Layer**: All hardware abstraction handled by Linux kernel drivers
- **No Unix User System**: No users, groups, passwords, or authentication - direct boot to GUI
- **Network-First Architecture**: Built around networking as the primary paradigm
- **Qt6 Full-Screen GUI**: Modern graphical interface from boot
- **Minimal footprint**: Lean system with only essential components
- **Portable**: dd-able disk image for USB flash drives
- **Custom init**: Lightweight C init system that launches GUI directly
- **Immutable base**: Read-only root filesystem with overlay for runtime data

## Architecture

```
┌─────────────────────────────────────┐
│      Qt6 GUI Application            │
│   (Direct Framebuffer Rendering)    │
└─────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────┐
│         Linux Kernel                │
│  • Framebuffer (/dev/fb0)           │
│  • Input devices (/dev/input/*)     │
│  • Network stack                    │
│  • All hardware drivers             │
└─────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────┐
│          Hardware                   │
│  • GPU, Display, Input devices      │
│  • Network adapters                 │
│  • Storage, etc.                    │
└─────────────────────────────────────┘
```

**Key Design Principles:**
- Linux kernel provides complete hardware abstraction and driver support
- Qt6 interfaces directly with kernel through /dev, /proc, /sys interfaces
- No intermediate Unix layers (no systemd, no user management, no shells by default)
- Network-first: networking capabilities exposed directly to GUI

## MVP Status

The current MVP provides:
- ✅ Custom init system written in C (no external dependencies)
- ✅ GUI-only architecture (no CLI/shell)
- ✅ dd-able AMD64 image creation scripts
- ✅ Minimal root filesystem structure
- ✅ Build system (Makefile)
- ✅ Direct network initialization via C ioctl
- ✅ DNS configuration with public fallback servers
- ✅ Docker container for testing
- ✅ Automated builds and publishing to GHCR
- ✅ Multi-architecture Docker images (AMD64 and ARM64)
- ✅ CI/CD pipeline for compiled release packages
- ✅ GitHub releases with pre-built binaries

## Prerequisites

To build SparkOS, you need:

- GCC compiler
- GNU Make
- Linux system (for building)

To create bootable images (optional):
- Root privileges
- `syslinux` bootloader
- `parted` partitioning tool
- `losetup` for loop devices
- `mkfs.ext4` filesystem tools

## Quick Start

### Using UEFI-Bootable Disk Image (Recommended - Boot from USB)

Download the UEFI-bootable image from the [GitHub Releases page](https://github.com/johndoe6345789/SparkOS/releases):

```bash
# Download the disk image (replace VERSION with actual version, e.g., v1.0.0)
wget https://github.com/johndoe6345789/SparkOS/releases/download/VERSION/sparkos.img.gz

# Decompress the image
gunzip sparkos.img.gz

# Write to USB drive (Linux - BE CAREFUL!)
sudo dd if=sparkos.img of=/dev/sdX bs=4M status=progress oflag=sync
```

**⚠️ WARNING**: Replace `/dev/sdX` with your actual USB device (e.g., `/dev/sdb`). This will **DESTROY ALL DATA** on the target drive!

**Boot Instructions:**
1. Insert the USB drive into a UEFI-capable system
2. Enter BIOS/UEFI settings (usually F2, F12, DEL, or ESC at boot)
3. Select the USB drive as boot device
4. SparkOS will boot automatically

The UEFI-bootable disk image includes:
- ✅ **UEFI boot support** with GRUB bootloader
- ✅ **GPT partition table** with ESP (EFI System Partition)
- ✅ **Linux kernel** ready to boot
- ✅ **SparkOS init system** (completely self-contained, no external dependencies)
- ✅ **Ready to boot** - Direct to Qt6 GUI, no CLI

### Using Pre-built Binary Package

Download the binary package from the [GitHub Releases page](https://github.com/johndoe6345789/SparkOS/releases):

```bash
# Download the latest release (replace VERSION with actual version, e.g., v1.0.0)
wget https://github.com/johndoe6345789/SparkOS/releases/download/VERSION/sparkos-release.zip

# Extract the package
unzip sparkos-release.zip
cd sparkos/

# The init binary is already compiled and ready to use
ls -lh init

# Copy to your rootfs or use directly
cp init /path/to/your/rootfs/sbin/init
```

The release package includes:
- Pre-compiled init binary (statically linked, ready to use)
- Complete source code
- Build scripts and configuration
- Root filesystem structure
- Full documentation

### Using Docker (Recommended for Testing)

The easiest way to test SparkOS is using the pre-built Docker image from GitHub Container Registry:

```bash
# Pull and run the latest image (automatically selects the correct architecture)
docker pull ghcr.io/johndoe6345789/sparkos:latest
docker run --rm ghcr.io/johndoe6345789/sparkos:latest

# Or build locally
docker build -t sparkos:local .
docker run --rm sparkos:local

# Or use Docker Compose for even simpler testing
docker-compose up

# Build for specific architecture
docker buildx build --platform linux/amd64 -t sparkos:amd64 --load .
docker buildx build --platform linux/arm64 -t sparkos:arm64 --load .
```

The Docker image includes:
- Pre-built init system binary
- Minimal root filesystem structure
- Test environment for validation
- **No CLI tools**: Pure GUI-only architecture
- **Multi-architecture support**: Available for both AMD64 (x86_64) and ARM64 (aarch64) architectures

When you run the Docker image, it automatically verifies:
- Custom init system binary (statically linked, no dependencies)
- Root filesystem structure

Images are automatically built and published to [GitHub Container Registry](https://github.com/johndoe6345789/SparkOS/pkgs/container/sparkos) on every push to main branch.

**Building Releases with Docker (No Root Required):**

Create release packages easily using Docker without needing root privileges or special tools:

```bash
# Build a release package for version v1.0.0
./scripts/docker-release.sh v1.0.0

# The release ZIP will be created in release/sparkos-release.zip
# This is the same artifact that GitHub Actions creates
```

### Building the Init System

```bash
# Build the init binary
make init

# Or use the quick build script
./scripts/build.sh
```

### Setting Up Root Filesystem

```bash
# Create the root filesystem structure
./scripts/setup_rootfs.sh

# Install init to rootfs
make install
```

### Creating a UEFI-Bootable Image

**Using Docker (Recommended - No Root Required):**

Build UEFI-bootable disk images easily using Docker without needing root privileges on your host:

```bash
# Build the UEFI-bootable disk image using Docker
make image-docker

# Or use the script directly
./scripts/build-image.sh

# The compressed UEFI-bootable image will be in release/sparkos.img.gz
```

This creates a complete UEFI-bootable image with:
- GPT partition table
- EFI System Partition (ESP) with FAT32
- GRUB UEFI bootloader
- Linux kernel
- SparkOS init system (no external dependencies)

**Traditional Method (Requires Root):**

⚠️ **Warning**: This method is for creating custom partitioned images and requires root privileges.

```bash
# Install required tools (Ubuntu/Debian)
sudo apt-get install syslinux parted

# Build everything and create image
make all
sudo make image
```

### Installing to USB Drive

Once you have created the `sparkos.img` file, use the installation script to write it to a USB drive or storage device:

```bash
# Use the installation script (RECOMMENDED)
sudo ./scripts/install.sh /dev/sdX

# The script will:
# - Validate the target drive
# - Display warnings about data destruction
# - Require confirmation before proceeding
# - Show progress during installation
# - Verify successful installation
```

Replace `/dev/sdX` with your actual USB device (e.g., `/dev/sdb`, `/dev/nvme1n1`).

**⚠️ WARNING**: This will permanently erase all data on the target drive!

## Project Structure

```
SparkOS/
├── .github/             # GitHub Actions workflows
│   └── workflows/
│       └── docker-publish.yml  # Docker build and publish workflow
├── config/              # Build configuration files
│   └── build.conf       # Build parameters
├── scripts/             # Build and setup scripts
│   ├── build.sh         # Quick build script
│   ├── setup_rootfs.sh  # Root filesystem setup
│   ├── create_image.sh  # Image creation script
│   └── install.sh       # Installation script for USB drives
├── src/                 # Source code
│   └── init.c           # Custom init system
├── rootfs/              # Root filesystem (generated)
│   ├── bin/             # Essential binaries
│   ├── sbin/            # System binaries
│   ├── etc/             # Configuration files
│   └── ...              # Standard FHS directories
├── Dockerfile           # Docker image definition
├── Makefile             # Build system
└── README.md            # This file
```

## Architecture

### Init System

SparkOS uses a custom init system (`/sbin/init`) that:
- Mounts essential filesystems (proc, sys, dev, tmp) via direct system calls
- Initializes network interfaces via direct C ioctl calls
- Spawns Qt6 GUI application directly
- Handles process reaping
- Respawns GUI on exit
- **No external dependencies**: Completely self-contained

### Root Filesystem

Minimal filesystem structure for GUI-only OS:
- `/sbin`: Init binary only
- `/etc`: Minimal system configuration
- `/proc`, `/sys`, `/dev`: Kernel interfaces
- `/tmp`: Temporary files
- `/usr`: Qt6 GUI application and libraries
- `/var`: Variable data (overlay mount)
- `/root`: Root home

### Networking

SparkOS provides network initialization through direct C code:
- **Interface Management**: Direct ioctl calls to bring up network interfaces
- **DNS**: Fallback to public DNS servers (8.8.8.8, 8.8.4.4, 1.1.1.1, 1.0.0.1)
- **DHCP**: Managed by Qt6 NetworkManager in GUI
- **WiFi**: Configured through Qt6 GUI

## Development

### CI/CD and Docker

SparkOS uses GitHub Actions for continuous integration and delivery:

**Automated Builds:**
- Docker images are automatically built on every push to main/develop branches
- Compiled release packages are automatically built on every push to main/develop branches
- Both are also built for pull requests (testing only, not published)
- Tagged releases automatically create versioned Docker images and GitHub releases with compiled binaries
- **Multi-architecture builds**: Images are built for both AMD64 (x86_64) and ARM64 (aarch64)

**Compiled Releases:**
- Pre-compiled init binaries are available as GitHub releases for version tags
- Release packages include: compiled init binary, source code, build scripts, and documentation
- Download releases from the [GitHub Releases page](https://github.com/johndoe6345789/SparkOS/releases)
- Build artifacts are available for all workflow runs (retained for 90 days)

**Container Registry:**
- Images are published to GitHub Container Registry (GHCR)
- Pull images: `docker pull ghcr.io/johndoe6345789/sparkos:latest`
- Available tags: `latest`, `main`, `develop`, version tags (e.g., `v1.0.0`)
- Docker will automatically select the correct architecture for your platform

**Docker Development:**
```bash
# Build Docker image locally
docker build -t sparkos:dev .

# Build for multiple architectures (requires Docker Buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t sparkos:multiarch .

# Test the image
docker run --rm sparkos:dev

# Or use Docker Compose
docker-compose up

# Inspect the init binary
docker run --rm sparkos:dev sh -c "ls -lh /sparkos/rootfs/sbin/init"
```

### Creating Releases

**Using Docker (Recommended - No Root Required):**

Build release packages locally using Docker without needing root privileges:

```bash
# Build a release package
./scripts/docker-release.sh v1.0.0

# The release ZIP will be in release/sparkos-release.zip
# This is identical to what GitHub Actions creates
```

**Creating a GitHub Release:**

1. **Commit and push your changes** to the main branch
2. **Create and push a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **GitHub Actions will automatically:**
   - Build the init binary
   - Create the release package ZIP
   - Build and publish Docker images (AMD64 + ARM64)
   - Create a GitHub Release with the artifacts
   - Publish to GitHub Container Registry

The release will be available at:
- **GitHub Releases:** https://github.com/johndoe6345789/SparkOS/releases
- **Docker Images:** `ghcr.io/johndoe6345789/sparkos:v1.0.0`

**Manual Release Creation:**

You can also create a release manually:
1. Go to https://github.com/johndoe6345789/SparkOS/releases/new
2. Choose or create a tag (e.g., `v1.0.0`)
3. Fill in the release title and description
4. Upload the `sparkos-release.zip` (built locally with `docker-release.sh`)
5. Publish the release

For detailed instructions on creating releases, see [RELEASING.md](RELEASING.md).

### Building Components

```bash
# Build init system only
make init

# Build release package using Docker
make docker-release

# Install to rootfs
make install

# Clean build artifacts
make clean

# Show help
make help
```

### Adding Components to Root Filesystem

To create a fully functional bootable system:

```bash
# Required components:
# 1. Qt6 GUI application - Build with make gui
# 2. Qt6 libraries - Copy Qt6 runtime libraries to rootfs/usr/lib
# 3. Linux kernel - Include kernel binary for bootloader

# Qt6 GUI is built and installed via:
make gui
make install  # Installs to rootfs/usr/bin/sparkos-gui

# Note: Qt6 must be compiled with linuxfb support for framebuffer rendering
```

## Future Roadmap

- [ ] Qt6/QML full screen GUI implementation
- [ ] Wayland compositor integration
- [ ] Network management via Qt6 NetworkManager
- [ ] WiFi configuration through GUI
- [ ] Advanced network configuration UI
- [ ] System settings and configuration UI

## Contributing

Contributions are welcome! This is an early-stage project focused on:
1. Maintaining minimal footprint
2. Clean, readable code
3. Proper documentation
4. GUI-only architecture (no CLI/shell)

## License

See LICENSE file for details.

## Notes

This is an MVP implementation. The system currently provides:
- Custom init system with direct network initialization
- GUI-only architecture (no CLI/shell)
- Build infrastructure
- Image creation tooling
- Self-contained init with no external dependencies

To create a fully bootable system, you'll also need:
- Linux kernel binary (`vmlinuz`) with framebuffer and networking support
- Qt6 GUI application (sparkos-gui)
- Qt6 runtime libraries
- Bootloader installation (handled by scripts)

Minimum System Requirements:
- Kernel: Linux kernel with framebuffer and networking support
- Init: Custom SparkOS init (included, no dependencies)
- GUI: Qt6 application with linuxfb platform support
- Libraries: Qt6 runtime libraries for GUI

System Philosophy:
- **No CLI tools**: Everything through Qt6 GUI
- **No shell**: Direct kernel-to-GUI communication
- **No busybox**: Self-contained init system
- **Network-first**: Networking integrated into GUI
