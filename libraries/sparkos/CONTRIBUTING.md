# Contributing to SparkOS

Thank you for your interest in contributing to SparkOS!

## Project Goals

SparkOS aims to be:
- **Minimal**: Only essential components
- **Clean**: Well-documented, readable code
- **Portable**: dd-able to USB drives
- **Extensible**: Easy to add features incrementally

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/johndoe6345789/SparkOS.git
   cd SparkOS
   ```

2. Build the system:
   ```bash
   ./scripts/build.sh
   ```

3. Make your changes

4. Test your changes:
   ```bash
   make clean
   make all
   ```

## Code Style

- **C/C++ Code**: Follow Linux kernel style guidelines
  - Use tabs for indentation
  - Keep lines under 80 characters when reasonable
  - Comment complex logic

- **Shell Scripts**: Follow Google Shell Style Guide
  - For runtime scripts (inside rootfs): Use `#!/bin/sh` for POSIX-compliant scripts (busybox compatibility)
  - For build scripts (host system): Can use `#!/bin/bash` when bash-specific features are needed
  - Quote variables
  - Use meaningful variable names

- **Documentation**: Write clear, concise documentation
  - Update README when adding features
  - Comment non-obvious code
  - Include usage examples

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request

## What to Contribute

Priority areas:
- Bug fixes
- Documentation improvements
- Build system enhancements
- Testing infrastructure
- Qt6/QML GUI components
- Wayland integration
- Package management
- Network configuration

## Questions?

Open an issue on GitHub for questions or discussions.
