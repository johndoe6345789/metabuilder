# Multi-stage build for Media Daemon
# Uses metabuilder/base-conan-media - apt packages and the media-daemon Conan
# C++ packages pre-installed. Build = compile only, zero downloads.
#
# Prerequisites: run python3 deployment/deployment.py build base first.

# Stage 1: Build environment
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-media:latest AS builder

# Ensure conancenter is available for version-range resolution. The base
# image may have disabled it when built with pkgrepo-only; re-enabling here
# lets Conan enumerate versions (openssl/[>=1.1 <4] etc.) without touching
# the Conan package cache that the base pre-populated.
RUN conan remote enable conancenter 2>/dev/null || \
    conan remote add conancenter https://center.conan.io/v2/ --force || true

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
    -DCMAKE_TOOLCHAIN_FILE=./conan_toolchain.cmake

RUN ninja

# Stage 1b: Libretro cores — built from source (not downloaded prebuilt) so
# there's no architecture-mismatch risk across host platforms. FCEUmm (NES)
# is the only one bundled today; git/build-essential are already in base-apt.
# Add more cores here (and to known_core_systems() in libretro_plugin.cpp)
# as they're wired up.
FROM ${BASE_REGISTRY}/base-apt:latest AS libretro-cores
RUN git clone --depth 1 https://github.com/libretro/libretro-fceumm.git /tmp/fceumm \
    && cd /tmp/fceumm \
    && make -f Makefile.libretro -j"$(nproc)" \
    && mkdir -p /out \
    && cp fceumm_libretro.so /out/

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

# Create directories. /data/cores, /data/system, /data/saves are also Docker
# volume mount points (see compose.yml) — pre-creating them here means a
# fresh named volume inherits media:media ownership from the image instead
# of defaulting to root, which would block the non-root runtime user from
# writing to it (same class of bug hit with DBAL's /app/keys).
RUN mkdir -p /data/media /data/temp /data/output /data/cache \
    /data/hls/radio /data/hls/tv /data/hls/retro /data/uploads \
    /data/cores /data/system /data/saves \
    /plugins /etc/media-daemon /var/log/media-daemon /var/log/icecast2 \
    && chown -R media:media /data /plugins /var/log/media-daemon /var/log/icecast2

# Bundle the libretro cores built in the libretro-cores stage
COPY --from=libretro-cores /out/fceumm_libretro.so /data/cores/fceumm_libretro.so
RUN chown media:media /data/cores/fceumm_libretro.so

# No WORKDIR was ever set in this stage (nor in base-apt), so it defaulted
# to Docker's own default of "/" -- writable only by root, not the `media`
# user this container actually runs as. The daemon writes upload staging
# files to a relative "./uploads/tmp/<hex>/" path, which needs a writable,
# persistent home; /data is the existing convention for that.
WORKDIR /data

# Copy binary
COPY --from=builder /app/build/media_daemon /usr/local/bin/

# Copy default config

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
