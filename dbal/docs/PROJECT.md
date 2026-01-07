# DBAL Project Structure

This directory contains the Database Abstraction Layer for MetaBuilder.

## Quick Links

- [Main README](../README.md) - Overview and getting started
- [Agent Guide](./AGENTS.md) - For AI agents and automated tools
- [Spark Integration](../shared/docs/SPARK_INTEGRATION.md) - GitHub Spark deployment guide
- [TypeScript Implementation](../development/README.md) - TS development guide
- [C++ Implementation](../production/README.md) - C++ production guide

## Directory Structure

```
dbal/
├── README.md                    # Quick reference
├── LICENSE                      # MIT License
├── .gitignore                   # Git ignore rules
│
├── docs/                        # Documentation
│   ├── README.md                # Main project documentation
│   ├── README_INDEX.md          # Documentation index
│   ├── PROJECT.md               # Complete project reference
│   ├── AGENTS.md                # Agent development guide
│   ├── RESTRUCTURE_SUMMARY.md   # Restructure details
│   └── BEFORE_AFTER.md          # Before/after comparison
│
├── development/                 # TypeScript implementation (fast iteration)
│   ├── src/                     # Source code
│   ├── tests/                   # Test suites
│   └── package.json             # NPM configuration
│
├── production/                  # C++ implementation (security & performance)
│   ├── src/                     # Source code
│   ├── include/                 # Header files
│   ├── tests/                   # Test suites
│   ├── docs/                    # C++ specific documentation
│   └── CMakeLists.txt           # CMake configuration
│
└── shared/                      # Shared resources
    ├── api/                     # Language-agnostic API definition
    │   ├── schema/              # Entity and operation schemas
    │   │   ├── entities/        # Entity definitions (YAML)
    │   │   ├── operations/      # Operation definitions (YAML)
    │   │   ├── errors.yaml      # Error codes and handling
    │   │   └── capabilities.yaml # Backend capability matrix
    │   └── versioning/
    │       └── compat.md        # Compatibility rules
    │
    ├── backends/                # Database backend schemas
    │   ├── prisma/              # Prisma ORM schemas
    │   └── sqlite/              # SQLite schemas
    │
    ├── common/                  # Shared utilities
    │   └── contracts/           # Conformance test contracts
    │
    ├── tools/                   # Development tools
    │   ├── codegen/             # Code generation from YAML
    │   └── conformance/         # Conformance test runners
    │
    ├── scripts/                 # Automation scripts
    └── docs/                    # Additional documentation
```
├── common/                      # Shared resources
│   ├── contracts/              # Conformance test definitions
│   ├── fixtures/               # Test data
│   └── golden/                 # Expected test results
│
├── ts/                          # TypeScript implementation
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts            # Public API
│   │   ├── core/               # Core abstractions
│   │   ├── adapters/           # Backend adapters
│   │   ├── query/              # Query builder
│   │   └── runtime/            # Config and telemetry
│   └── tests/
│
├── cpp/                         # C++ implementation
│   ├── CMakeLists.txt
│   ├── include/dbal/           # Public headers
│   ├── src/                    # Implementation
│   └── tests/
│
├── backends/                    # Backend-specific assets
│   └── sqlite/
│       └── schema.sql          # SQLite schema
│
├── tools/                       # Build and dev tools
│   ├── codegen/                # Type generation scripts
│   └── conformance/            # Test runners
│
├── scripts/                     # Entry point scripts
│   ├── build.py                # Build all implementations
│   ├── test.py                 # Run all tests
│   └── conformance.py          # Run conformance tests
│
└── docs/                        # Additional documentation
    └── SPARK_INTEGRATION.md    # GitHub Spark guide
```

## Quick Start

### Generate Types

```bash
python shared/tools/codegen/gen_types.py
```

### Build Everything

```bash
python shared/scripts/build.py
```

### Run Tests

```bash
python shared/scripts/test.py
```

### Run Conformance Tests

```bash
python shared/scripts/conformance.py
```

## Development Workflow

1. **Define schema** in `shared/api/schema/entities/` and `shared/api/schema/operations/`
2. **Generate types** with `python shared/tools/codegen/gen_types.py`
3. **Implement adapters** in `development/src/adapters/` and `production/src/adapters/`
4. **Write tests** in `shared/common/contracts/`
5. **Build** with `python shared/scripts/build.py`
6. **Test** with `python shared/scripts/test.py`
7. **Deploy** following `shared/docs/SPARK_INTEGRATION.md`

## Key Concepts

- **Language Agnostic**: API defined in YAML, implementations in TS and C++
- **Security First**: C++ daemon isolates credentials, enforces ACL
- **Development Speed**: TypeScript for rapid iteration
- **Production Security**: C++ for hardened production deployments
- **Conformance**: Both implementations must pass identical tests

## Support

- Issues: [GitHub Issues](https://github.com/yourorg/metabuilder/issues)
- Discussions: [GitHub Discussions](https://github.com/yourorg/metabuilder/discussions)
- Documentation: [docs.metabuilder.io/dbal](https://docs.metabuilder.io/dbal)
