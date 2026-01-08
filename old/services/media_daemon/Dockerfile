# Multi-stage build for Media Daemon
# Stage 1: Build environment
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    git \
    curl \
    pkg-config \
    python3 \
    python3-pip \
    libssl-dev \
    libc-ares-dev \
    libbrotli-dev \
    libcurl4-openssl-dev \
    uuid-dev \
    zlib1g-dev \
    libpq-dev \
    libmysqlclient-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Conan
RUN pip3 install conan

# Configure Conan
RUN conan profile detect

# Copy source code
WORKDIR /app
COPY . .

# Install dependencies via Conan
WORKDIR /app/build
RUN conan install ../build-config/conanfile.txt \
    --output-folder=. \
    --build=missing \
    -s build_type=Release

# Build
RUN cmake ../build-config \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake

RUN ninja

# Stage 2: Runtime image
FROM ubuntu:22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    pandoc \
    texlive-xetex \
    texlive-fonts-recommended \
    fonts-liberation \
    curl \
    ca-certificates \
    libssl3 \
    libc-ares2 \
    libcurl4 \
    libpq5 \
    libmysqlclient21 \
    libsqlite3-0 \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r media && useradd -r -g media media

# Create directories
RUN mkdir -p /data/media /data/temp /data/output /data/cache \
    /data/hls/radio /data/hls/tv \
    /plugins /etc/media-daemon /var/log/media-daemon \
    && chown -R media:media /data /plugins /var/log/media-daemon

# Copy binary
COPY --from=builder /app/build/media_daemon /usr/local/bin/

# Copy default config
COPY config/media-daemon.yaml /etc/media-daemon/config.yaml

# ImageMagick policy (allow PDF processing)
RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml || true

# Switch to non-root user
USER media

# Expose ports
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8090/health || exit 1

# Volumes
VOLUME ["/data/media", "/data/output", "/data/hls", "/plugins"]

# Entry point
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["media_daemon", "--config", "/etc/media-daemon/config.yaml"]
