# Build the metabuilder-cli C++ binary
# Context: monorepo root (..)
# Requires: metabuilder/base-conan-cli:latest. It is published by the
#           deployment repo (github.com/johndoe6345789/deployment), so pull
#           and retag rather than building it:
#
#   docker pull ghcr.io/johndoe6345789/deployment/base-conan-cli:latest
#   docker tag  ghcr.io/johndoe6345789/deployment/base-conan-cli:latest \
#               metabuilder/base-conan-cli:latest

ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-cli:latest AS builder

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

# Minimal runtime image.
#
# Must be ubuntu:24.04, matching the builder: base-conan-cli derives from
# base-apt, which is ubuntu:24.04. This was debian:bookworm-slim, whose glibc
# 2.36 and GCC 12 libstdc++ are older than the ones the binary is compiled
# against, so the image built fine and then could not run its own entrypoint:
#
#   libm.so.6: version `GLIBC_2.38' not found
#   libstdc++.so.6: version `GLIBCXX_3.4.32' not found
#
# The OpenSSL runtime is libssl3t64 on noble, not libssl3 — renamed by the
# 64-bit time_t transition.
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends \
      libssl3t64 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/cli/build/metabuilder-cli /usr/local/bin/metabuilder-cli

ENTRYPOINT ["metabuilder-cli"]
