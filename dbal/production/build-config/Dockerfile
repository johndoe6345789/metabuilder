# Multi-stage Dockerfile for DBAL Daemon
# Optimized for production deployments with minimal image size

# Stage 1: Builder
FROM ubuntu:22.04 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    git \
    python3 \
    python3-pip \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory - mirror the original structure
WORKDIR /dbal

# Copy entire dbal/production structure
COPY include/ include/
COPY src/ src/

# Copy build-config as a subdirectory (maintains CMakeLists.txt paths)
COPY build-config/CMakeLists.txt build-config/CMakeLists.txt
COPY build-config/conanfile.txt build-config/conanfile.txt

# Install Conan and dependencies
RUN pip3 install --no-cache-dir conan && \
    conan profile detect --force

# Build the daemon from build-config directory
WORKDIR /dbal/build-config
RUN conan install . --output-folder=build --build=missing && \
    cmake -G Ninja -DCMAKE_BUILD_TYPE=Release -S . -B build \
        -DCMAKE_TOOLCHAIN_FILE=build/build/Release/generators/conan_toolchain.cmake && \
    cmake --build build --target dbal_daemon

# Stage 2: Runtime
FROM ubuntu:22.04

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libsqlite3-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -r -u 1000 -m -s /bin/bash dbal

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /dbal/build-config/build/dbal_daemon /app/dbal_daemon

# Copy default config (can be overridden with volume mount)
RUN echo "# DBAL Configuration" > /app/config.yaml

# Change ownership to dbal user
RUN chown -R dbal:dbal /app

# Switch to non-root user
USER dbal

# Environment variables with defaults
ENV DBAL_BIND_ADDRESS=0.0.0.0 \
    DBAL_PORT=8080 \
    DBAL_LOG_LEVEL=info \
    DBAL_MODE=production \
    DBAL_CONFIG=/app/config.yaml

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${DBAL_PORT}/health || exit 1

# Run in daemon mode by default
CMD ["sh", "-c", "./dbal_daemon --bind ${DBAL_BIND_ADDRESS} --port ${DBAL_PORT} --mode ${DBAL_MODE} --config ${DBAL_CONFIG} --daemon"]
