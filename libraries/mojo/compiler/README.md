# Mojo Compiler

A complete Mojo programming language compiler written in Mojo itself.

## Quick Start

### Prerequisites

```bash
# Install Pixi (package manager)
curl -fsSL https://pixi.sh/install.sh | bash

# Install environment
cd mojo
pixi install
```

### Run Compiler

```bash
# Compile and run a Mojo file
pixi run mojo program.mojo

# Format code
pixi run mojo format ./

# Run tests
pixi run test
```

## Architecture

The compiler processes Mojo source code in 5 phases:

1. **Frontend** - Lexing (tokenization) and parsing (AST generation)
2. **Semantic** - Type checking and symbol resolution
3. **IR** - Conversion to MLIR (Multi-Level Intermediate Representation)
4. **Codegen** - LLVM IR generation and optimization
5. **Runtime** - Memory management and runtime support

See `CLAUDE.md` for detailed architecture documentation.

## Directory Structure

```
src/
├── frontend/         # Lexer, parser, AST
├── semantic/         # Type system, checker
├── ir/              # MLIR generation
├── codegen/         # LLVM backend
└── runtime/         # Runtime support

examples/           # Compiler usage examples
tests/              # Comprehensive test suite
CLAUDE.md           # Architecture guide
README.md           # This file
```

## Tests

```bash
# Run all tests
pixi run test

# Run specific test category
pixi run test -- tests/test_lexer.mojo
pixi run test -- tests/test_type_checker.mojo

# Run integration tests
pixi run test -- tests/test_compiler_pipeline.mojo
```

## Key Features

- ✅ Lexing & Parsing
- ✅ Type inference
- ✅ Trait system
- ✅ Generic types
- ✅ Ownership checking
- ✅ MLIR generation
- ✅ LLVM IR generation
- ✅ Optimization passes
- ✅ GPU kernel support
- ✅ Python interoperability

## Development

For detailed development guidelines, see `CLAUDE.md`.

### Adding Features

1. Update `src/frontend/ast.mojo` (add AST node)
2. Update `src/frontend/parser.mojo` (add parsing rule)
3. Update `src/semantic/type_checker.mojo` (add type checking)
4. Update `src/ir/mlir_gen.mojo` (add IR generation)
5. Update `src/codegen/llvm_backend.mojo` (add code generation)
6. Add tests to `tests/`

## Examples

See `examples/` directory for:
- Simple programs
- Type system demonstration
- Trait usage
- Generic types
- Async/await
- GPU kernels

## Documentation

- **Architecture**: See `CLAUDE.md`
- **Type System**: See `src/semantic/CLAUDE.md` (if available)
- **Error Messages**: See `src/frontend/CLAUDE.md` (if available)

## Status

**Phase 4 Complete** - Full compiler implementation with:
- Complete lexer and parser
- Type inference and checking
- MLIR and LLVM IR generation
- Optimization passes
- Ownership and borrowing system

**Next**: Performance optimization, advanced features

---

**Last Updated**: January 23, 2026
**Source**: Modular Inc. Mojo Compiler
