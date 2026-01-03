# MetaBuilder CLI

This CLI targets MetaBuilder services via HTTP and includes a Lua runtime for executing package scripts. Uses Conan + CMake for dependency management and builds.

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

Conan provisions these dependencies:
- [`cpr`](https://github.com/libcpr/cpr) - HTTP requests
- [`lua`](https://www.lua.org/) - Lua 5.4 interpreter
- [`sol2`](https://github.com/ThePhD/sol2) - C++/Lua binding
- [`nlohmann_json`](https://github.com/nlohmann/json) - JSON handling

## Running

The executable looks for `METABUILDER_BASE_URL` (default `http://localhost:3000`):

```bash
# API commands
./build/bin/metabuilder-cli auth session
./build/bin/metabuilder-cli user list

# Package commands (run from project root)
./build/bin/metabuilder-cli package list
./build/bin/metabuilder-cli package generate my_forum --category social --with-schema --entities Thread,Post
./build/bin/metabuilder-cli package run codegen_studio package_template get_categories
```

## Commands

### API Commands

```bash
metabuilder-cli auth session                    # Show current session
metabuilder-cli auth login <email> <password>   # Authenticate
metabuilder-cli user list                       # List users
metabuilder-cli user get <userId>               # Get user by ID
metabuilder-cli tenant list                     # List tenants
metabuilder-cli tenant get <tenantId>           # Get tenant by ID
metabuilder-cli dbal <subcommand>               # DBAL operations
```

### Package Commands

```bash
metabuilder-cli package list                    # List packages with scripts
metabuilder-cli package run <pkg> <script>      # Run a Lua script from a package
metabuilder-cli package generate <id> [opts]    # Generate a new package
```

#### Generate Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Display name | Derived from package_id |
| `--description <desc>` | Package description | Auto-generated |
| `--category <cat>` | Package category | `ui` |
| `--min-level <n>` | Minimum access level 0-6 | `2` |
| `--primary` | Package can own routes | Yes |
| `--dependency` | Package is dependency-only | No |
| `--with-schema` | Include database schema | No |
| `--entities <e1,e2>` | Entity names (comma-separated) | None |
| `--with-components` | Include component scaffolding | No |
| `--components <c1,c2>` | Component names | None |
| `--deps <d1,d2>` | Package dependencies | None |
| `--output <dir>` | Output directory | `./packages` |
| `--dry-run` | Preview without writing | No |

#### Examples

```bash
# Generate a forum package with schema
metabuilder-cli package generate my_forum \
    --category social \
    --with-schema \
    --entities ForumThread,ForumPost,ForumReply

# Generate a UI widget as dependency
metabuilder-cli package generate stat_widget \
    --category ui \
    --dependency \
    --with-components \
    --components StatCard,StatChart

# Preview without creating files
metabuilder-cli package generate test_pkg --dry-run
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `METABUILDER_BASE_URL` | API base URL | `http://localhost:3000` |
| `METABUILDER_PACKAGES` | Packages directory | `./packages` |

## Continuous Integration

Changes under `frontends/cli/` trigger `.github/workflows/ci/cli.yml`, which:
1. Runs Conan to install dependencies
2. Configures and builds with CMake/Ninja
3. Validates that `metabuilder-cli --help` exits cleanly
