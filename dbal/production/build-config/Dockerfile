# Multi-stage build for DBAL C++ daemon
# Context: dbal/ (set by docker-compose — wider context for codegen access to shared/)
# Requires: metabuilder/base-apt:latest (Ubuntu 24.04 + build tools)

ARG BUILD_TYPE=Release

# ── Build stage ──────────────────────────────────────────────────────────────
FROM metabuilder/base-apt:latest AS builder

ARG BUILD_TYPE

WORKDIR /dbal

# Install Conan (codegen dependency), detect Conan profile
RUN pip3 install --break-system-packages conan \
    && conan profile detect --force

# Copy dependency manifest first (layer caching)
COPY production/build-config/conanfile.py ./build-config/conanfile.py

# Install C++ dependencies via Conan (absolute output path for reliability)
# Conan 2.x places generators under build/<build_type>/generators/
RUN cd build-config \
    && conan install . \
       --output-folder=/dbal/build \
       --build=missing \
       -s build_type=${BUILD_TYPE} \
       -s compiler.cppstd=20 \
    && GENERATORS_DIR=$(dirname $(find /dbal/build -name conan_toolchain.cmake -print -quit)) \
    && echo "Generators dir: $GENERATORS_DIR" \
    && ln -sf "$GENERATORS_DIR"/* /dbal/build/

# Copy source code and build files FIRST
COPY production/CMakeLists.txt ./
COPY production/src/ ./src/
COPY production/include/ ./include/
# Tests not built in production (BUILD_TESTING=OFF by default); copy for optional test builds
COPY production/tests/ ./tests/

# Copy schemas and codegen script, then generate types into the include dir
COPY shared/api/schema/ ./shared/api/schema/
COPY shared/seeds/database/ ./shared/seeds/database/
COPY shared/tools/codegen/gen_types.py ./shared/tools/codegen/gen_types.py
RUN python3 shared/tools/codegen/gen_types.py \
    --schema-dir ./shared/api/schema \
    --cpp-output ./include/dbal/core/types.generated.hpp \
    --cpp-only

# Build with CMake (use absolute path for toolchain file)
RUN cd /dbal/build \
    && cmake /dbal \
       -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
       -DCMAKE_TOOLCHAIN_FILE=/dbal/build/conan_toolchain.cmake \
       -G Ninja \
    && cmake --build . --parallel \
    && strip dbal_daemon

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM metabuilder/base-apt:latest

WORKDIR /app

# Create non-root user
RUN useradd -r -u 1001 -m -s /bin/bash dbal || \
    useradd -m -s /bin/bash dbal

# Copy binary from builder
COPY --from=builder /dbal/build/dbal_daemon /app/dbal_daemon

# Embed auth config — can be overridden via DBAL_AUTH_CONFIG
COPY --from=builder /dbal/shared/api/schema/auth /app/schemas/auth

# Embed workflow event config + workflow definitions
COPY --from=builder /dbal/shared/api/schema/events    /app/schemas/events
COPY --from=builder /dbal/shared/api/schema/workflows /app/schemas/workflows

# Embed JSON query procedures (used by QueryRouteHandler at runtime)
COPY --from=builder /dbal/shared/api/schema/queries   /app/schemas/queries

# Embed seed data
COPY --from=builder /dbal/shared/seeds/database /app/seeds/database

# Create data directories
RUN mkdir -p /app/data/blobs

# Default config (overridden by docker-compose env vars + mounted config)
RUN echo "# DBAL Configuration" > /app/config.yaml

# Environment defaults
ENV DBAL_BIND_ADDRESS=0.0.0.0 \
    DBAL_PORT=8080 \
    DBAL_LOG_LEVEL=info \
    DBAL_MODE=production \
    DBAL_CONFIG=/app/config.yaml \
    DBAL_SCHEMA_DIR=/app/schemas/entities \
    DBAL_TEMPLATE_DIR=/app/templates/sql \
    DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json \
    DBAL_EVENT_CONFIG=/app/schemas/events/event_config.json \
    DBAL_BLOB_BACKEND=filesystem \
    DBAL_BLOB_ROOT=/app/data/blobs

VOLUME ["/app/data/blobs"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${DBAL_PORT}/health || exit 1

RUN chown -R dbal:dbal /app
USER dbal

CMD ["sh", "-c", "./dbal_daemon --bind ${DBAL_BIND_ADDRESS} --port ${DBAL_PORT} --mode ${DBAL_MODE} --config ${DBAL_CONFIG} --daemon"]
