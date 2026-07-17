FROM ubuntu:24.04 AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake g++ make git ca-certificates \
    libssl-dev libjsoncpp-dev uuid-dev zlib1g-dev \
    libc-ares-dev libsqlite3-dev libbrotli-dev \
    libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /deps
RUN git clone --depth 1 --branch v1.9.3 \
    https://github.com/drogonframework/drogon.git && \
    cd drogon && git submodule update --init && \
    cmake -B build -DBUILD_EXAMPLES=OFF \
    -DCMAKE_BUILD_TYPE=Release && \
    cmake --build build -j$(nproc) && \
    cmake --install build

WORKDIR /build
COPY backend/CMakeLists.txt .
COPY backend/src/ src/
RUN cmake -B out -DCMAKE_BUILD_TYPE=Release && \
    cmake --build out -j$(nproc)

FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3t64 libjsoncpp25 libc-ares2 libpq5 \
    libsqlite3-0 libbrotli1 uuid-runtime \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/out/s3server /usr/bin/
COPY backend/migrations/ /app/migrations/
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /data/s3
ENV S3_DATA_DIR=/data/s3

EXPOSE 9000
ENTRYPOINT ["/app/entrypoint.sh"]
