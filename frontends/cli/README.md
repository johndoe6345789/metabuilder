# MetaBuilder CLI

This simple CLI targets MetaBuilder services via HTTP and uses Conan + Ninja for dependency management and builds.

## Requirements

- [Conan 2](https://docs.conan.io/) (used for dependency resolution)
- CMake 3.27+ (the Conan toolchain generator targets this minimum)
- Ninja (build backend)
- A running MetaBuilder frontend (defaults to `http://localhost:3000`)

## Building

```bash
cd frontends/cli
conan install . --output-folder build --build missing
cmake -S . -B build -G Ninja
cmake --build build
```

Conan will provision [`cpr`](https://github.com/libcpr/cpr) for HTTP requests and generate `conan_toolchain.cmake` inside `build/`.

## Running

The executable looks for `METABUILDER_BASE_URL` (default `http://localhost:3000`):

```bash
METABUILDER_BASE_URL=http://localhost:3000 ./build/bin/metabuilder-cli auth session
METABUILDER_BASE_URL=http://localhost:3000 ./build/bin/metabuilder-cli user list
```

Available commands are listed when running without arguments or with an unrecognized command.

## Continuous Integration

Changes under `frontends/cli/` now trigger `.github/workflows/ci/cli.yml`, which runs Conan, configures/ninja-build the project, and validates that `metabuilder-cli --help` exits cleanly.
