# SparkOS Docker Image
# Multi-stage build for minimal final image size

# Build stage - use gcc image which has all build tools pre-installed
FROM gcc:13-bookworm AS builder

# Set working directory
WORKDIR /build

# Copy source files
COPY src/ ./src/
COPY Makefile .
COPY scripts/ ./scripts/

# Build the init system
RUN make init

# Runtime stage - use Alpine for minimal size
FROM alpine:3.19

# Install file command for testing init binary
# file package provides the file(1) command to determine file type
COPY scripts/docker-install-packages.sh /tmp/
RUN /tmp/docker-install-packages.sh

# SparkOS Philosophy: No CLI tools, GUI-only experience
# The init system is completely self-contained with no external dependencies
# All functionality is provided through direct system calls in C

# Create minimal rootfs structure
COPY scripts/docker-setup-rootfs.sh /tmp/
RUN /tmp/docker-setup-rootfs.sh

# Copy built init binary from builder
COPY --from=builder /build/init /sparkos/rootfs/sbin/init

# Set up basic configuration files
COPY scripts/docker-setup-config.sh /tmp/
RUN /tmp/docker-setup-config.sh

# Create a test entrypoint
COPY scripts/test.sh /sparkos/test.sh
RUN chmod +x /sparkos/test.sh

WORKDIR /sparkos

# Set entrypoint
ENTRYPOINT ["/sparkos/test.sh"]
