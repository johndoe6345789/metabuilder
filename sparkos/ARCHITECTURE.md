# SparkOS Architecture

## Overview

SparkOS is a revolutionary operating system that uses the Linux kernel for hardware abstraction but ditches traditional Unix conventions. Instead of shells, users, and Unix utilities, SparkOS boots directly into a Qt6 GUI that interfaces with the kernel through standard Linux APIs.

## Core Philosophy

1. **No Unix Baggage**: No user/group system, no shells, no Unix utilities by default
2. **Direct Kernel Interface**: GUI communicates directly with Linux kernel
3. **Network-First**: Networking is a primary interface, not an afterthought
4. **GUI-Only**: No CLI unless explicitly needed for debugging
5. **Linux for Drivers**: Leverage Linux's excellent hardware support

## System Architecture

```
Boot Sequence:
Hardware → UEFI/BIOS → GRUB → Linux Kernel → init (PID 1) → Qt6 GUI

Stack Layers:
┌──────────────────────────────────────────┐
│         Qt6 GUI Application              │ ← User Interface
│    (sparkos-gui executable)              │
├──────────────────────────────────────────┤
│      Custom Init System (PID 1)          │ ← Process Manager
│    • Mounts filesystems                  │
│    • Spawns/respawns GUI                 │
│    • Reaps zombie processes              │
├──────────────────────────────────────────┤
│          Linux Kernel                    │ ← Hardware Abstraction
│    • All device drivers                  │
│    • Framebuffer driver                  │
│    • Input device drivers                │
│    • Network stack & drivers             │
│    • File system support                 │
├──────────────────────────────────────────┤
│            Hardware                      │
│    • Display, GPU, Input                 │
│    • Network adapters                    │
│    • Storage devices                     │
└──────────────────────────────────────────┘
```

## Design Decisions

### Why Ditch Unix Conventions?

Traditional Unix systems were designed for multi-user, time-sharing mainframes in the 1970s. Modern personal computing and embedded systems have different needs:

- **Single User**: Most devices have one user - authentication overhead is unnecessary
- **GUI Primary**: Modern users expect graphical interfaces, not command lines
- **Network Central**: Modern computing is network-centric, not file-centric
- **Direct Access**: Applications should talk directly to kernel, not through layers of abstraction

### Why Keep Linux Kernel?

- **Hardware Support**: Linux has exceptional driver support for modern hardware
- **Driver Abstraction**: Well-tested, stable hardware abstraction layer
- **Network Stack**: Robust, high-performance networking
- **File Systems**: Mature support for various filesystems
- **Security**: SELinux, namespaces, cgroups for isolation
- **Community**: Active development and security updates

### Why Qt6 GUI?

- **Cross-Platform**: Qt works on many platforms (future portability)
- **Framebuffer Support**: Can render directly to Linux framebuffer without X11/Wayland
- **Modern**: Native look and feel, hardware acceleration support
- **Complete**: Rich widget set, networking APIs, file I/O
- **Performant**: Efficient rendering and event handling

### Why No X11/Wayland?

- **Direct Rendering**: Qt can render directly to framebuffer (/dev/fb0)
- **Less Overhead**: No display server running in between
- **Simpler**: Fewer processes, less memory usage
- **Embedded-Friendly**: Same approach used in embedded systems

### Why Network-First?

Modern computing is inherently networked. Instead of treating networking as an add-on:
- Network APIs exposed directly to GUI
- Cloud storage as primary storage paradigm
- Web technologies integrated (future: embedded browser)
- Real-time updates and communication built-in

## Future Architecture

### Planned Components

1. **Qt6/QML GUI**
   - Full-screen application
   - Android-like interface design
   - Desktop-oriented workflow

2. **Wayland Compositor**
   - Custom compositor for SparkOS
   - Minimal resource usage
   - Touch and mouse support

3. **Network Management**
   - Qt6 NetworkManager integration
   - WiFi configuration UI
   - VPN and advanced networking UI

## Security Considerations

- Static binaries reduce attack surface
- Minimal running processes
- Root filesystem can be read-only
- Sudo for privilege escalation
- Future: SELinux/AppArmor integration

## Performance

- Fast boot time (seconds, not minutes)
- Low memory footprint (~20MB base init system)
- No unnecessary background services
- Efficient init system (no external dependencies)

## Portability

- AMD64 (x86_64) and ARM64 (aarch64) architectures
- dd-able disk images
- USB flash drive ready
- Multi-architecture Docker images

## Extension Points

The architecture is designed for easy extension:

1. **Init system**: Can be enhanced with service management
2. **Filesystem**: Can add more mount points and partitions
3. **Boot process**: Can integrate other bootloaders
4. **GUI**: Clean separation allows GUI to be optional

## Development Workflow

1. Modify source code in `src/`
2. Build with `make init`
3. Test init in isolation
4. Install to `rootfs/` with `make install`
5. Create test image with `sudo make image`
6. Test on real hardware or VM

## References

- Linux Kernel Documentation
- Filesystem Hierarchy Standard (FHS)
- POSIX Standards
- Qt6 Documentation
- Wayland Protocol Specification
