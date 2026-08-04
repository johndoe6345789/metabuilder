FROM debian:bookworm AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates cmake g++ make ninja-build python3-pip \
       pkg-config autoconf automake libtool \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --break-system-packages --no-cache-dir conan

WORKDIR /src
COPY . .

RUN conan profile detect --force \
    && conan install . --output-folder=build --build=missing \
       -s build_type=Release \
    && cmake -S . -B build -G Ninja \
       -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake \
       -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build \
    && cmake --install build --prefix /opt/codegen-backend

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libpq5 \
       libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /opt/codegen-backend /opt/codegen-backend
COPY migrations/ ./migrations/

RUN mkdir -p /data

ENV PORT=5001
ENV DATABASE_URL="host=codegen-db port=5432 dbname=codegen user=codegen password=codegen"
ENV MIGRATIONS_DIR=/app/migrations
ENV SQLITE_MIGRATION_PATH=/data/codeforge.db

EXPOSE 5001
VOLUME ["/data"]

CMD ["/opt/codegen-backend/bin/codegen-backend"]
