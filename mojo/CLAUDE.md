# Mojo Project Guide

**Status**: Compiler implementation integrated (Jan 23, 2026)
**Location**: `/mojo/` directory
**Components**: Mojo compiler (21 source files) + example programs (37 files)

## Overview

This directory contains:
1. **Mojo Compiler** - Full compiler implementation written in Mojo (from Modular repo)
2. **Sample Programs** - Mojo language examples and reference implementations

## Directory Structure

```
mojo/
├── compiler/              # Mojo compiler implementation
│   ├── src/
│   │   ├── frontend/      # Lexer, parser, AST (4 files)
│   │   ├── semantic/      # Type system, checking (3 files)
│   │   ├── ir/            # MLIR code generation (2 files)
│   │   ├── codegen/       # LLVM backend, optimizer (2 files)
│   │   ├── runtime/       # Memory, reflection, async (3 files)
│   │   └── __init__.mojo  # Compiler entry point
│   ├── examples/          # Compiler usage examples (9 files)
│   ├── tests/             # Test suite (15 files)
│   ├── CLAUDE.md          # Compiler architecture guide
│   └── README.md          # Quick start
├── samples/               # Mojo language examples
│   ├── game-of-life/      # Conway's Game of Life (3 versions)
│   ├── snake/             # SDL3 snake game
│   ├── gpu-functions/     # GPU kernels
│   ├── python-interop/    # Python integration
│   ├── operators/         # Custom operators
│   ├── testing/           # Test framework
│   ├── layouts/           # Tensor operations
│   ├── process/           # Process handling
│   └── src/               # Basic demos
├── CLAUDE.md              # This file
├── mojoproject.toml       # SDK configuration
└── README.md              # Project overview
```

## Compiler Architecture

The Mojo compiler is organized into 5 main phases:

### 1. Frontend (Lexer & Parser)
- **lexer.mojo**: Tokenization - converts source text into tokens
- **parser.mojo**: Syntax analysis - builds abstract syntax tree (AST)
- **ast.mojo**: AST node definitions for all language constructs
- **node_store.mojo**: AST node storage and retrieval
- **source_location.mojo**: Tracks source positions for error reporting

### 2. Semantic Analysis (Type System)
- **type_system.mojo**: Type definitions, traits, and type rules
- **type_checker.mojo**: Type inference and validation
- **symbol_table.mojo**: Scope management and symbol resolution

### 3. Intermediate Representation (IR)
- **mlir_gen.mojo**: Converts AST to MLIR (Multi-Level Intermediate Representation)
- **mojo_dialect.mojo**: Mojo-specific MLIR operations and dialects

### 4. Code Generation (Backend)
- **llvm_backend.mojo**: Lowers MLIR to LLVM IR
- **optimizer.mojo**: Optimization passes

### 5. Runtime
- **memory.mojo**: Memory management and allocation
- **reflection.mojo**: Runtime reflection and introspection
- **async_runtime.mojo**: Async/await support

## Running the Compiler

### Prerequisites

The Mojo project uses Pixi for environment management:

```bash
cd mojo
pixi install
```

### Building & Testing

```bash
# Run tests
pixi run test

# Run compiler demo
pixi run demo

# Format code
pixi run format

# Run specific example
cd samples/game-of-life
pixi run main
```

## Development

### Adding New Features

1. **Language Feature** → Update `frontend/ast.mojo`
2. **Type Checking** → Update `semantic/type_checker.mojo`
3. **IR Generation** → Update `ir/mlir_gen.mojo`
4. **Tests** → Add to `tests/`

### Testing Strategy

- **Unit tests**: Each module has corresponding `test_*.mojo` file
- **Integration tests**: Full compiler pipeline tested in `test_compiler_pipeline.mojo`
- **Example tests**: Sample programs in `examples/` and `samples/` demonstrate features

## Key Language Features

The compiler supports:
- Structs with lifecycle methods (`__init__`, `__copyinit__`, `__del__`)
- Traits for type abstractions
- Generic types and parametric types
- SIMD operations
- GPU kernels and device programming
- Python interoperability
- Async/await and coroutines
- FFI bindings to C libraries
- Memory ownership and borrowing

## Module Dependencies

Each module is self-contained with minimal dependencies:
- Frontend modules depend on `ast.mojo`
- Semantic modules depend on `frontend/` modules
- IR generation depends on `semantic/` modules
- Backend depends on `ir/` modules
- Runtime is independent

No external dependencies required (pure Mojo standard library).

## Contributing

When making changes to the compiler:

1. **Read** the relevant module CLAUDE.md (see `compiler/CLAUDE.md`)
2. **Plan** changes using the phase model above
3. **Implement** in phases (don't skip phases)
4. **Test** with `pixi run test`
5. **Document** changes in module docstrings

## Performance Considerations

The compiler is designed for:
- **Correctness first**: Type safety and memory safety
- **Performance**: SIMD and GPU code generation
- **Interoperability**: Python integration without overhead

See `compiler/CLAUDE.md` for detailed architecture notes.

## Next Steps

- [ ] Complete ownership system (Phase 4)
- [ ] Optimize code generation (Phase 5)
- [ ] Add more standard library functions
- [ ] Improve error messages
- [ ] Add debugger integration

---

**Last Updated**: January 23, 2026
**Source**: Integrated from modular repo
**Status**: Ready for development
