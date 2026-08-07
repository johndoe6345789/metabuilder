# syntax=docker/dockerfile:1.7
ARG DEPS_IMAGE=debian:sid
ARG RUNTIME_IMAGE=debian:sid-slim

FROM ${DEPS_IMAGE} AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates cmake ninja-build clang-tidy \
    gcc-13 g++-13 git make \
    pkg-config libssl-dev libcurl4-openssl-dev \
    python3 python3-pip && \
    update-alternatives --install \
        /usr/bin/gcc gcc /usr/bin/gcc-13 100 && \
    update-alternatives --install \
        /usr/bin/g++ g++ /usr/bin/g++-13 100 && \
    update-alternatives --install \
        /usr/bin/cc cc /usr/bin/gcc-13 100 && \
    pip3 install --break-system-packages \
        "conan>=2.0,<3.0" && \
    conan profile detect --force && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY backend/conanfile.txt .

ENV CONAN_SKIP_TEST=1
RUN conan install . --build=missing \
    -s build_type=Release \
    -s compiler.cppstd=20 \
    -of /build/conan

COPY backend/CMakeLists.txt .
COPY backend/src/ src/
RUN cmake -B out -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=/build/conan/conan_toolchain.cmake \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    -DCMAKE_CXX_CLANG_TIDY=clang-tidy \
    && cmake --build out -j$(nproc)

FROM ${RUNTIME_IMAGE}
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates libssl3 libcurl4 wget && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/out/dockerterminal-server /usr/bin/

EXPOSE 5000
ENTRYPOINT ["/usr/bin/dockerterminal-server"]
