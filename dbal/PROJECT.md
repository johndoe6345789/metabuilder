# DBAL Project Structure

This directory contains the Database Abstraction Layer for MetaBuilder.

## Quick Links

- [Main README](README.md) - Overview and architecture
- [Agent Guide](AGENTS.md) - For AI agents and automated tools
- [Spark Integration](docs/SPARK_INTEGRATION.md) - GitHub Spark deployment guide
- [TypeScript Implementation](ts/README.md) - TS development guide
- [C++ Implementation](cpp/README.md) - C++ production guide

## Directory Structure

```
dbal/
├── README.md                    # Main documentation
├── LICENSE                      # MIT License
├── AGENTS.md                    # Agent development guide
├── .gitignore                   # Git ignore rules
│
├── api/                         # Language-agnostic API definition
│   ├── schema/                  # Entity and operation schemas
│   │   ├── entities/           # Entity definitions (YAML)
│   │   ├── operations/         # Operation definitions (YAML)
│   │   ├── errors.yaml         # Error codes and handling
│   │   └── capabilities.yaml   # Backend capability matrix
│   └── versioning/
│       └── compat.md           # Compatibility rules
│
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
│   ├── prisma/
│   │   └── schema.prisma       # Prisma schema
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
python tools/codegen/gen_types.py
```

### Build Everything

```bash
python scripts/build.py
```

### Run Tests

```bash
python scripts/test.py
```

### Run Conformance Tests

```bash
python scripts/conformance.py
```

## Development Workflow

1. **Define schema** in `api/schema/entities/` and `api/schema/operations/`
2. **Generate types** with `python tools/codegen/gen_types.py`
3. **Implement adapters** in `ts/src/adapters/` and `cpp/src/adapters/`
4. **Write tests** in `common/contracts/`
5. **Build** with `python scripts/build.py`
6. **Test** with `python scripts/test.py`
7. **Deploy** following `docs/SPARK_INTEGRATION.md`

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
