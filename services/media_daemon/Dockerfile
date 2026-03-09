# Multi-stage build for Media Daemon
# Uses metabuilder/base-conan-deps — all apt packages and Conan C++ packages
# pre-installed. Build = compile only, zero downloads.
#
# Prerequisites: run deployment/build-base-images.sh first.

# Stage 1: Build environment
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-deps:latest AS builder

# Copy source code
WORKDIR /app
COPY . .

# Install dependencies via Conan (packages cached in base image)
WORKDIR /app/build
RUN conan install ../build-config/conanfile.txt \
    --output-folder=. \
    --build=missing \
    -s build_type=Release \
    -c tools.system.package_manager:mode=install

# Build
RUN cmake ../build-config \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=./build/Release/generators/conan_toolchain.cmake

RUN ninja

# Stage 2: Runtime — base-apt has most deps; add texlive here (too large for base)
FROM ${BASE_REGISTRY}/base-apt:latest AS runtime

RUN for i in 1 2 3 4 5; do \
      apt-get update && apt-get install -y --no-install-recommends \
        texlive-xetex texlive-fonts-recommended \
        icecast2 \
      && break \
      || (echo "apt-get failed attempt $i/5, retrying in $((i*10))s..." && sleep $((i*10))); \
    done && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r media && useradd -r -g media media

# Create directories
RUN mkdir -p /data/media /data/temp /data/output /data/cache \
    /data/hls/radio /data/hls/tv \
    /plugins /etc/media-daemon /var/log/media-daemon /var/log/icecast2 \
    && chown -R media:media /data /plugins /var/log/media-daemon /var/log/icecast2

# Copy binary
COPY --from=builder /app/build/media_daemon /usr/local/bin/

# Copy default config
COPY config/media-daemon.yaml /etc/media-daemon/config.yaml

# Copy icecast config
COPY config/icecast.xml /etc/icecast2/icecast.xml
RUN chown -R media:media /etc/icecast2

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ImageMagick policy (allow PDF processing)
RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml || true

# Switch to non-root user
USER media

# Expose ports (8090 = media daemon, 8000 = icecast)
EXPOSE 8090 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8090/health || exit 1

# Volumes
VOLUME ["/data/media", "/data/output", "/data/hls", "/plugins"]

# Entry point — starts icecast + media daemon
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/usr/local/bin/entrypoint.sh"]
