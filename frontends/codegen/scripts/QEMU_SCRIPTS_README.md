# Multi-Architecture Build Scripts

This directory contains helper scripts for QEMU multi-architecture Docker builds.

## Scripts

### 🚀 build-multiarch.sh

Builds multi-architecture Docker images locally using QEMU and Docker Buildx.

**Usage:**
```bash
# Make executable
chmod +x scripts/build-multiarch.sh

# Build for local testing (loads into Docker)
./scripts/build-multiarch.sh myapp latest

# Build and push to registry
./scripts/build-multiarch.sh myapp latest "linux/amd64,linux/arm64" ghcr.io --push

# Custom platforms
./scripts/build-multiarch.sh myapp v1.0 "linux/amd64,linux/arm64,linux/arm/v7" ghcr.io --push
```

**Parameters:**
1. `IMAGE_NAME` - Docker image name (default: `myapp`)
2. `IMAGE_TAG` - Image tag (default: `latest`)
3. `PLATFORMS` - Comma-separated platforms (default: `linux/amd64,linux/arm64`)
4. `REGISTRY` - Container registry (default: `ghcr.io`)
5. `--push` - Push to registry (omit to load locally)

**Features:**
- ✅ Automatic QEMU setup
- ✅ Buildx builder configuration
- ✅ Color-coded output
- ✅ Error handling
- ✅ Progress indicators

### 🔍 validate-qemu.sh

Validates QEMU installation and multi-architecture build capabilities.

**Usage:**
```bash
# Make executable
chmod +x scripts/validate-qemu.sh

# Run validation
./scripts/validate-qemu.sh
```

**Checks:**
- ✅ Docker installation
- ✅ Docker Buildx availability
- ✅ QEMU installation
- ✅ QEMU binaries functionality
- ✅ Buildx builder setup
- ✅ Platform support (AMD64, ARM64)
- ✅ Test builds for each platform
- ✅ CI/CD configuration validation

**Exit Codes:**
- `0` - All validations passed
- `1` - One or more validations failed

## Quick Start

### First Time Setup

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Validate your environment
./scripts/validate-qemu.sh

# 3. Build your first multi-arch image
./scripts/build-multiarch.sh codeforge latest
```

### Local Development

```bash
# Build and load into local Docker (AMD64 only for speed)
./scripts/build-multiarch.sh myapp dev

# Run the image
docker run -p 80:80 ghcr.io/myapp:dev
```

### Production Release

```bash
# Build multi-arch and push to registry
./scripts/build-multiarch.sh codeforge v1.2.3 "linux/amd64,linux/arm64" ghcr.io --push

# Verify the manifest
docker manifest inspect ghcr.io/codeforge:v1.2.3
```

## Supported Platforms

### Default Platforms
- `linux/amd64` - Intel/AMD 64-bit (x86_64)
- `linux/arm64` - ARM 64-bit (aarch64)

### Additional Platforms (Optional)
- `linux/arm/v7` - ARM 32-bit (armv7l) - Raspberry Pi 3 and older
- `linux/arm/v6` - ARM 32-bit (armv6l) - Raspberry Pi Zero
- `linux/ppc64le` - IBM POWER (Little Endian)
- `linux/s390x` - IBM Z mainframe
- `linux/386` - Intel/AMD 32-bit (i386)

## CI/CD Integration

These scripts are reference implementations. The actual CI/CD pipelines use:

### GitHub Actions
```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
  with:
    platforms: linux/amd64,linux/arm64
```

### CircleCI
```yaml
- run:
    name: Install QEMU
    command: docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```

### GitLab CI
```yaml
before_script:
  - docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
  - docker buildx create --name multiarch --driver docker-container --use
```

### Jenkins
```groovy
sh 'docker run --rm --privileged multiarch/qemu-user-static --reset -p yes'
sh 'docker buildx create --name multiarch --driver docker-container --use'
```

## Troubleshooting

### Permission Denied

```bash
# Run with sudo
sudo ./scripts/build-multiarch.sh myapp latest

# Or add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### QEMU Not Found

```bash
# Manually install QEMU
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```

### Buildx Not Available

```bash
# Install Docker Buildx
docker buildx install

# Verify installation
docker buildx version
```

### Slow Builds

Cross-compilation (especially AMD64 → ARM64) is slower than native builds. This is normal.

**Optimization tips:**
- Use build cache: `--cache-from type=gha --cache-to type=gha,mode=max`
- Build single platform for development: remove `--platform` or specify one arch
- Use native runners: GitHub Actions has ARM64 runners available

### Platform Not Supported

Some base images don't support all platforms. Check the base image documentation.

```bash
# Check available platforms for an image
docker manifest inspect alpine:latest
```

## Performance Benchmarks

Approximate build times for a typical web application:

| Configuration | Time | Notes |
|--------------|------|-------|
| AMD64 only (native) | 5-8 min | Fastest |
| ARM64 only (emulated) | 10-15 min | Cross-compiled on AMD64 |
| AMD64 + ARM64 | 15-20 min | Both platforms |
| AMD64 + ARM64 + ARMv7 | 20-30 min | Three platforms |

## Environment Variables

Scripts support these environment variables:

```bash
# Docker registry credentials
export DOCKER_USERNAME="your-username"
export DOCKER_PASSWORD="your-token"

# Custom registry
export REGISTRY="ghcr.io"

# Build options
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain
```

## Examples

### Example 1: Development Build

```bash
# Quick local build for testing
./scripts/build-multiarch.sh myapp dev

# Test the image
docker run -p 3000:80 ghcr.io/myapp:dev
curl http://localhost:3000
```

### Example 2: Staging Release

```bash
# Build and push to staging
./scripts/build-multiarch.sh myapp staging "linux/amd64,linux/arm64" ghcr.io --push

# Deploy on staging server
docker pull ghcr.io/myapp:staging
docker run -d -p 80:80 ghcr.io/myapp:staging
```

### Example 3: Production Release

```bash
# Build with version tag
./scripts/build-multiarch.sh myapp v2.1.0 "linux/amd64,linux/arm64" ghcr.io --push

# Also tag as latest
docker tag ghcr.io/myapp:v2.1.0 ghcr.io/myapp:latest
docker push ghcr.io/myapp:latest
```

### Example 4: IoT/Edge Devices

```bash
# Build for Raspberry Pi (ARMv7 + ARM64)
./scripts/build-multiarch.sh iot-app v1.0 "linux/arm64,linux/arm/v7" ghcr.io --push

# Pull on Raspberry Pi
docker pull ghcr.io/iot-app:v1.0
docker run ghcr.io/iot-app:v1.0
```

## Additional Resources

- [QEMU Integration Guide](../QEMU_INTEGRATION.md) - Full documentation
- [CI/CD Summary](../QEMU_CI_CD_SUMMARY.md) - Implementation details
- [Docker Buildx](https://docs.docker.com/buildx/) - Official documentation
- [QEMU User Static](https://github.com/multiarch/qemu-user-static) - QEMU binaries

## Contributing

When adding new scripts:

1. Follow the existing script structure
2. Add color-coded output for better UX
3. Include error handling with meaningful messages
4. Document usage and parameters
5. Update this README

## Support

For issues with multi-architecture builds:

1. Run validation: `./scripts/validate-qemu.sh`
2. Check Docker version: `docker --version` (v20.10+ recommended)
3. Verify QEMU: `docker run --rm multiarch/qemu-user-static --version`
4. Review logs for specific error messages

---

*Last Updated: 2024*
*Maintained by: Development Team*
