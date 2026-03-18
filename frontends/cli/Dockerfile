# Build the metabuilder-cli C++ binary
# Context: monorepo root (..)
# Requires: metabuilder/base-conan-deps:latest base image

ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-deps:latest AS builder

# Copy CLI source
COPY frontends/cli/ /app/cli/

# Install Conan deps and build
WORKDIR /app/cli
RUN conan install . \
      --output-folder=build \
      --build=missing \
      -s build_type=Release \
      -c tools.system.package_manager:mode=install \
    && cmake -S . -B build -G Ninja \
         -DCMAKE_BUILD_TYPE=Release \
         -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake \
    && cmake --build build --config Release

# Minimal runtime image
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      libssl3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/cli/build/metabuilder-cli /usr/local/bin/metabuilder-cli

ENTRYPOINT ["metabuilder-cli"]
