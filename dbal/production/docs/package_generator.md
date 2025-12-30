# Package Generator C++ CLI

A native C++ command-line tool for generating MetaBuilder package scaffolding using embedded Lua scripts.

## Features

- **Native Performance**: Compiled C++ binary with embedded Lua runtime
- **Sandboxed Execution**: Lua scripts run in isolated environment (no `os`, `io`, `debug`)
- **Cross-Platform**: Builds on Linux, macOS, and Windows via Conan/CMake
- **Full Validation**: Package configs validated before generation

## Building

### Prerequisites

- C++17 compiler (GCC 9+, Clang 10+, MSVC 2019+)
- CMake 3.20+
- Conan 2.x package manager

### Build Steps

```bash
cd dbal/production/build-config

# Install dependencies with Conan
conan install . --output-folder=build --build=missing

# Configure CMake
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build . --target package_generator

# Install (optional)
cmake --install . --prefix=/usr/local
```

### Conan Dependencies

The tool uses these Conan packages:
- `lua/5.4.7` - Lua interpreter
- `sol2/3.3.1` - C++/Lua binding library
- `nlohmann_json/3.11.3` - JSON parsing

## Usage

```bash
# Basic usage
package_generator new my_package

# With options
package_generator new my_forum \
    --category social \
    --min-level 2 \
    --with-schema \
    --entities Thread,Post,Reply

# Quick minimal package
package_generator quick my_widget --dependency

# List categories
package_generator list-categories

# Validate config file
package_generator validate config.json

# Preview without writing
package_generator new my_package --dry-run
```

## Commands

### `new <package_id>`

Create a new package with full scaffolding including:
- `seed/metadata.json` - Package configuration
- `seed/components.json` - Component definitions
- `seed/layout.json` - UI layout
- `seed/scripts/init.lua` - Initialization hooks
- `seed/scripts/tests/` - Test files
- `static_content/icon.svg` - Package icon
- `README.md` - Documentation

### `quick <package_id>`

Create a minimal package with just essential files:
- `seed/metadata.json`
- `seed/components.json`
- `seed/scripts/init.lua`

### `list-categories`

Display available package categories:
- ui, editors, tools, social, media, gaming
- admin, config, core, demo, development, managers

### `validate <file>`

Validate a JSON configuration file for package generation.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Display name | Derived from package_id |
| `--description <desc>` | Package description | Auto-generated |
| `--category <cat>` | Package category | `ui` |
| `--min-level <n>` | Minimum access level (0-6) | `2` |
| `--primary` | Package can own routes | Yes |
| `--dependency` | Package is dependency-only | No |
| `--with-schema` | Include database schema | No |
| `--entities <e1,e2>` | Entity names (comma-separated) | None |
| `--with-components` | Include component scaffolding | No |
| `--components <c1,c2>` | Component names | None |
| `--deps <d1,d2>` | Package dependencies | None |
| `--output <dir>` | Output directory | `./packages` |
| `--dry-run` | Preview without writing | No |

## Examples

### Create a Forum Package

```bash
package_generator new forum_module \
    --name "Forum Module" \
    --description "Discussion forum with threads and posts" \
    --category social \
    --min-level 1 \
    --with-schema \
    --entities ForumThread,ForumPost,ForumReply \
    --deps ui_permissions,dashboard
```

### Create a UI Widget

```bash
package_generator new stat_widget \
    --category ui \
    --min-level 2 \
    --dependency \
    --with-components \
    --components StatCard,StatChart,StatTable
```

### Create Admin Tool

```bash
package_generator new admin_reports \
    --category admin \
    --min-level 4 \
    --with-schema \
    --entities Report,ReportSchedule
```

## Architecture

```
package_generator (C++)
    │
    ├── arg_parser.hpp      # Command-line parsing
    ├── lua_runner.hpp      # sol2-based Lua execution
    ├── file_writer.hpp     # File system operations
    └── main.cpp            # CLI entry point
            │
            │ calls
            ▼
    package_template (Lua)
    ├── init.lua            # Module entry point
    ├── templates.lua       # Template generators
    ├── generator.lua       # Orchestration
    └── cli.lua             # Lua CLI (standalone use)
```

## Lua Sandbox

The Lua environment is sandboxed for security:

**Allowed:**
- `base` - Core Lua functions
- `string` - String manipulation
- `table` - Table operations
- `math` - Mathematical functions
- `utf8` - UTF-8 handling

**Blocked:**
- `os` - Operating system access
- `io` - File I/O
- `debug` - Debug facilities
- `ffi` - Foreign function interface
- `package.loadlib` - Native library loading

All file operations are performed by the C++ host, not Lua scripts.

## Integration with MetaBuilder

The generated packages are fully compatible with MetaBuilder's package system:

1. Run generator from project root
2. Files are written to `packages/<package_id>/`
3. Run `npm run packages:index` to update package registry
4. Package is available in the platform

## Troubleshooting

### "Module not found"

Ensure you're running from the MetaBuilder project root, or specify the scripts path:
```bash
export METABUILDER_SCRIPTS=/path/to/packages/codegen_studio/seed/scripts
```

### Build errors with sol2

sol2 requires C++17. Ensure your compiler supports it:
```bash
cmake .. -DCMAKE_CXX_STANDARD=17
```

### Conan package not found

Update Conan remotes:
```bash
conan remote add conancenter https://center.conan.io
conan install . --build=missing
```
