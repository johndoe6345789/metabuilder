# MetaBuilder Build & Compilation Info

## Yes, Docker Builds Everything From Source! ✅

All services are compiled automatically when you run `docker-compose up --build`.

---

## Build Matrix

| Service | Language | Builder | Compile Time | Output |
|---------|----------|---------|--------------|--------|
| **Next.js App** | TypeScript | Node.js | ~2-5 min | Optimized JS bundle |
| **DBAL Daemon** | C++17 | Conan + CMake + Ninja | ~5-10 min | `dbal_daemon` binary |
| **Media Daemon** | C++17 | Conan + CMake + Ninja | ~8-15 min | `media_daemon` binary |
| **CLI** | C++17 | Conan + CMake + Ninja | ~5-10 min | `metabuilder-cli` binary |
| **Tools Container** | Multi | Node.js + C++ | ~15-20 min | Full toolkit |

**Total First Build**: ~25-40 minutes (cached layers make subsequent builds much faster)

---

## Detailed Build Process

### 1. Next.js App ✅

**Dockerfile**: [`docker/Dockerfile.app`](docker/Dockerfile.app)

**Build Steps**:
```dockerfile
# Install dependencies
RUN npm ci

# Build for production
RUN npm run build
```

**What Gets Compiled**:
- TypeScript → JavaScript
- React components → Optimized bundles
- Server-side code → Node.js runtime
- Static assets → Optimized for CDN

**Output**: `.next/` directory with production build

---

### 2. DBAL C++ Daemon ✅

**Dockerfile**: [`dbal/production/build-config/Dockerfile`](../dbal/production/build-config/Dockerfile)

**Build Steps**:
```dockerfile
# Stage 1: Builder
FROM ubuntu:22.04 AS builder

# Install build tools
RUN apt-get install build-essential cmake ninja-build

# Install Conan dependency manager
RUN pip3 install conan && conan profile detect

# Build with Conan + CMake
RUN conan install . --output-folder=build --build=missing
RUN cmake -G Ninja -DCMAKE_BUILD_TYPE=Release -S . -B build
RUN cmake --build build --target dbal_daemon

# Stage 2: Runtime (minimal)
FROM ubuntu:22.04
COPY --from=builder /build/build/dbal_daemon /app/dbal_daemon
```

**What Gets Compiled**:
- C++17 source code
- Dependencies via Conan:
  - PostgreSQL client library
  - HTTP server (Boost.Beast or similar)
  - JSON parser
  - Lua interpreter
- Links into single optimized binary

**Output**: `dbal_daemon` (~5-10 MB binary)

**Build Args**:
- `BUILD_TYPE=Release` (production) - Optimized, stripped
- `BUILD_TYPE=Debug` (development) - Debug symbols, verbose logging

---

### 3. Media Daemon ✅

**Dockerfile**: [`services/media_daemon/Dockerfile`](../services/media_daemon/Dockerfile)

**Build Steps**:
```dockerfile
# Stage 1: Builder
FROM ubuntu:22.04 AS builder

# Install massive toolchain
RUN apt-get install build-essential cmake ninja-build \
    libssl-dev libcurl4-openssl-dev libpq-dev

# Conan dependencies
RUN conan install ../build-config/conanfile.txt --build=missing

# Build
RUN cmake ../build-config -G Ninja -DCMAKE_BUILD_TYPE=Release
RUN ninja

# Stage 2: Runtime (with FFmpeg, ImageMagick, Pandoc)
FROM ubuntu:22.04 AS runtime
RUN apt-get install ffmpeg imagemagick pandoc texlive-xetex
COPY --from=builder /app/build/media_daemon /usr/local/bin/
```

**What Gets Compiled**:
- C++17 media processing engine
- Job queue system
- Plugin loader
- Dependencies:
  - HTTP server
  - Database clients
  - JSON/YAML parsers
  - Icecast client (for radio)
  - Libretro loader (for retro gaming)

**Runtime Dependencies** (NOT compiled, included in image):
- FFmpeg - Video/audio transcoding
- ImageMagick - Image processing
- Pandoc + LaTeX - Document conversion

**Output**: `media_daemon` binary + plugin system

---

### 4. CLI ✅

**Dockerfile**: [`docker/Dockerfile.cli`](docker/Dockerfile.cli)

**Build Steps**:
```dockerfile
# Stage 1: Builder
FROM ubuntu:22.04 AS builder

# Install build tools
RUN apt-get install build-essential cmake ninja-build
RUN pip3 install conan && conan profile detect

# Build CLI
WORKDIR /build/cli
RUN conan install . --output-folder build --build missing
RUN cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
RUN cmake --build build --config Release

# Stage 2: Runtime
FROM ubuntu:22.04
COPY --from=builder /build/cli/build/bin/metabuilder-cli /usr/local/bin/
```

**What Gets Compiled**:
- C++17 CLI application
- Dependencies via Conan:
  - cpr (HTTP client)
  - lua (Lua 5.4 interpreter)
  - sol2 (C++/Lua binding)
  - nlohmann_json (JSON)

**Output**: `metabuilder-cli` binary

---

### 5. Tools Container ✅

**Dockerfile**: [`docker/Dockerfile.tools`](docker/Dockerfile.tools)

**Multi-stage Build**:
```dockerfile
# Stage 1: Node.js + Prisma
FROM node:20-alpine AS node-builder
RUN npm ci && npx prisma generate

# Stage 2: CLI builder (same as above)
FROM ubuntu:22.04 AS cli-builder
# ... compile CLI ...

# Stage 3: Combined runtime
FROM node:20-alpine
COPY --from=node-builder /build/frontends/nextjs /app/nextjs
COPY --from=cli-builder /build/cli/build/bin/metabuilder-cli /usr/local/bin/
```

**What Gets Compiled/Bundled**:
- Prisma client (TypeScript → Node.js bindings)
- MetaBuilder CLI (C++)
- All npm dependencies

**Output**: Complete admin toolkit with both Node.js and C++ tools

---

## Dependency Management

### Conan (C++ Dependencies)

All C++ projects use Conan for dependency management:

**Example** (`dbal/production/conanfile.txt`):
```ini
[requires]
boost/1.82.0
libpq/15.3
nlohmann_json/3.11.2
lua/5.4.6

[generators]
CMakeDeps
CMakeToolchain
```

**Benefits**:
- Automatic dependency resolution
- Binary caching (faster rebuilds)
- Cross-platform builds
- Version locking

### npm (Node.js Dependencies)

**Example** (`frontends/nextjs/package.json`):
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "@prisma/client": "5.x"
  }
}
```

---

## Build Caching

Docker layer caching speeds up rebuilds:

### First Build (Cold Cache)
```bash
[+] Building 1234.5s (42/42) FINISHED
 => [builder 1/8] FROM ubuntu:22.04          15.2s
 => [builder 2/8] RUN apt-get install...    125.3s
 => [builder 3/8] RUN pip3 install conan     45.1s
 => [builder 4/8] COPY source files           0.5s
 => [builder 5/8] RUN conan install...      420.8s  # Downloads deps
 => [builder 6/8] RUN cmake configure        25.3s
 => [builder 7/8] RUN cmake build           380.2s  # Compiles C++
 => [builder 8/8] COPY binary                 0.1s
 => [runtime 1/3] FROM ubuntu:22.04          12.1s
 => [runtime 2/3] RUN apt-get install...     89.5s
 => [runtime 3/3] COPY binary                 0.2s
```

### Subsequent Builds (Warm Cache)
```bash
[+] Building 45.2s (42/42) FINISHED
 => [builder 1/8] FROM ubuntu:22.04           0.0s  # CACHED
 => [builder 2/8] RUN apt-get install...      0.0s  # CACHED
 => [builder 3/8] RUN pip3 install conan      0.0s  # CACHED
 => [builder 4/8] COPY source files           0.5s
 => [builder 5/8] RUN conan install...        5.2s  # Mostly cached
 => [builder 6/8] RUN cmake configure        15.3s
 => [builder 7/8] RUN cmake build            20.1s  # Incremental
 => [builder 8/8] COPY binary                 0.1s
 => [runtime 1/3] FROM ubuntu:22.04           0.0s  # CACHED
 => [runtime 2/3] RUN apt-get install...      0.0s  # CACHED
 => [runtime 3/3] COPY binary                 0.2s
```

---

## Quick Build Commands

### Build Everything
```bash
cd deployment

# Development (with debug symbols)
docker-compose -f docker/docker-compose.development.yml build

# Production (optimized)
docker-compose -f docker/docker-compose.production.yml build

# Force rebuild (no cache)
docker-compose -f docker/docker-compose.production.yml build --no-cache
```

### Build Specific Service
```bash
# Just DBAL daemon
docker-compose -f docker/docker-compose.production.yml build dbal-daemon

# Just Next.js app
docker-compose -f docker/docker-compose.production.yml build metabuilder-app

# Just Media daemon
docker-compose -f docker/docker-compose.production.yml build media-daemon
```

### Build and Start
```bash
# Build + run in one command
docker-compose -f docker/docker-compose.production.yml up --build -d
```

---

## Build Optimization

### Multi-stage Builds

All Dockerfiles use multi-stage builds:

**Advantages**:
- ✅ Smaller final images (100-200 MB vs 2-3 GB)
- ✅ Build tools not included in production
- ✅ Faster deployment
- ✅ Better security (smaller attack surface)

**Example Size Comparison**:
- Builder stage: ~2.5 GB (with Conan cache, build tools)
- Runtime stage: ~150 MB (just binary + minimal libs)

### Parallel Builds

Use BuildKit for parallel builds:

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build all services in parallel
docker-compose -f docker/docker-compose.production.yml build --parallel
```

---

## Troubleshooting Builds

### Common Build Failures

**1. Conan Dependency Resolution**
```bash
# Error: Package not found
# Fix: Update Conan profile
docker-compose exec dbal-daemon conan profile update settings.compiler.libcxx=libstdc++11 default
```

**2. CMake Configuration**
```bash
# Error: Could not find package
# Fix: Ensure conanfile.txt has all dependencies
cat dbal/production/conanfile.txt
```

**3. Out of Memory**
```bash
# Error: Compiler killed (OOM)
# Fix: Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory → 8GB+
```

**4. Build Timeout**
```bash
# Error: Build timeout
# Fix: Increase build timeout
docker-compose build --build-arg BUILDKIT_STEP_LOG_MAX_SIZE=50000000
```

### Clean Rebuild

```bash
# Remove all build artifacts
docker-compose down -v
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up --build --force-recreate
```

---

## CI/CD Integration

The project is ready for CI/CD:

### GitHub Actions Example

```yaml
name: Build All Services
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build DBAL
        run: docker build -f deployment/docker/Dockerfile.dbal .

      - name: Build App
        run: docker build -f deployment/docker/Dockerfile.app .

      - name: Build Media
        run: docker build -f deployment/docker/Dockerfile.media .

      - name: Run Tests
        run: docker-compose -f deployment/docker/docker-compose.development.yml run metabuilder-app npm test
```

---

## Summary

✅ **All services compile from source automatically**
✅ **Multi-stage builds for minimal production images**
✅ **Conan manages C++ dependencies**
✅ **npm manages Node.js dependencies**
✅ **Docker layer caching speeds up rebuilds**
✅ **No manual compilation required**

Just run:
```bash
./deployment/deploy.sh prod --bootstrap
```

Everything compiles and deploys automatically! 🚀

---

**Last Updated**: 2026-01-03
**Generated with Claude Code**
