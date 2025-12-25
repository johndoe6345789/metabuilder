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
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /build

# Copy source files
COPY CMakeLists.txt conanfile.txt ./
COPY include/ include/
COPY src/ src/
COPY tests/ tests/

# Build the daemon
RUN cmake -G Ninja -DCMAKE_BUILD_TYPE=Release . && \
    ninja dbal_daemon

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
COPY --from=builder /build/dbal_daemon /app/dbal_daemon

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
