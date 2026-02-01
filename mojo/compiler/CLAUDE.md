# Mojo Compiler Architecture Guide

**Location**: `/mojo/compiler/`
**Implementation**: 21 Mojo source files
**Tests**: 15 comprehensive test files
**Source**: Modular Inc. Mojo compiler (integrated Jan 23, 2026)

## Compiler Overview

The Mojo compiler transforms source code through 5 distinct phases:

```
Source Code → [Frontend] → [Semantic] → [IR] → [Codegen] → [Runtime] → Machine Code
    |              |            |        |         |           |
    |     Lexer    |    Type    | MLIR   | LLVM    | Memory    |
    |     Parser   |    Checker | Dialects | IR    | Reflection|
    |     AST      | Symbol Tbl |        | Optimizer| Async    |
```

## Phase 1: Frontend (Lexing & Parsing)

**Files**: `src/frontend/` (4 files)

### Components

#### `lexer.mojo` - Tokenization
- Converts source text character-by-character into tokens
- Handles:
  - Keywords (`fn`, `struct`, `var`, `def`, etc.)
  - Identifiers and operators
  - Literals (integers, floats, strings)
  - Comments and whitespace

**Key Types**:
```mojo
struct Token:
    token_type: TokenType
    lexeme: String
    literal: Any
    line: Int
    column: Int
```

**Usage**:
```mojo
let lexer = Lexer(source_code)
while lexer.has_next():
    let token = lexer.next_token()
    process(token)
```

#### `parser.mojo` - Syntax Analysis
- Builds AST from token stream
- Implements recursive descent parser
- Generates semantic errors for syntax issues
- Returns root AST node

**Key Methods**:
```mojo
fn parse(tokens: List[Token]) -> ASTNode:
    # Parse complete program

fn parse_statement() -> ASTNode:
    # Parse individual statements

fn parse_expression() -> ASTNode:
    # Parse expressions with precedence
```

#### `ast.mojo` - Abstract Syntax Tree
- Defines all AST node types
- Represents program structure

**Key Node Types**:
```mojo
struct FunctionNode:      # fn definitions
    name: String
    params: List[ParamNode]
    return_type: TypeNode
    body: List[ASTNode]

struct StructNode:        # struct definitions
    name: String
    fields: List[FieldNode]
    methods: List[FunctionNode]

struct ExpressionNode:    # Expressions
    operator: String
    left: ASTNode
    right: ASTNode
```

#### `source_location.mojo` - Error Tracking
- Tracks source code positions
- Used for error messages

**Key Structure**:
```mojo
struct SourceLocation:
    file: String
    line: Int
    column: Int
    text: String  # Source line
```

#### `node_store.mojo` - AST Storage
- Efficient storage and retrieval of AST nodes
- Implements node pooling for performance

## Phase 2: Semantic Analysis (Type Checking)

**Files**: `src/semantic/` (3 files)

### Components

#### `type_system.mojo` - Type Definitions
- Defines all types in Mojo
- Implements trait system
- Type relationship rules

**Key Types**:
```mojo
struct Type:
    name: String
    kind: TypeKind  # Primitive, Struct, Trait, etc.
    fields: List[FieldType]
    methods: List[MethodType]

struct Trait:
    name: String
    requirements: List[MethodSignature]
    implementations: List[Type]
```

**Built-in Types**:
- Primitives: `i32`, `f64`, `Bool`, `String`
- Collections: `List[T]`, `Dict[K,V]`
- Parametric: `SIMD[dtype, width]`

#### `type_checker.mojo` - Type Validation
- Infers types for expressions
- Validates type compatibility
- Reports type errors

**Key Responsibilities**:
1. Traverse AST
2. Infer expression types
3. Check type compatibility
4. Validate function calls
5. Check trait implementations

**Key Methods**:
```mojo
fn check_type(node: ASTNode) -> Type:
    # Infer and return type of node

fn is_compatible(expected: Type, actual: Type) -> Bool:
    # Check if types are compatible

fn check_function_call(func: FunctionNode, args: List[ASTNode]):
    # Validate function call
```

#### `symbol_table.mojo` - Scope Management
- Tracks variable and function definitions
- Manages scope hierarchy
- Resolves identifiers

**Key Operations**:
```mojo
fn enter_scope():      # New lexical scope
fn exit_scope():       # End scope
fn define(name: String, type: Type):  # Define symbol
fn lookup(name: String) -> Type:      # Find symbol
```

## Phase 3: Intermediate Representation (IR Generation)

**Files**: `src/ir/` (2 files)

### Components

#### `mlir_gen.mojo` - MLIR Code Generation
- Converts AST to MLIR operations
- MLIR is Modular's intermediate representation
- Bridges frontend and backend

**Key Pattern**:
```
Mojo AST → MLIR Ops → LLVM IR → Machine Code
```

**Key Operations**:
```mojo
fn gen_function(func: FunctionNode) -> MLIRFunction:
    # Generate MLIR for function

fn gen_expression(expr: ExpressionNode) -> MLIROp:
    # Generate MLIR for expression
```

#### `mojo_dialect.mojo` - Mojo-Specific Ops
- Defines Mojo custom operations in MLIR
- Examples:
  - GPU kernel launches
  - Python interop calls
  - Async/await primitives

**Custom Operations**:
- `mojo.gpu_launch` - GPU kernel execution
- `mojo.python_call` - Python interoperability
- `mojo.async_await` - Async/await

## Phase 4: Code Generation (Backend)

**Files**: `src/codegen/` (2 files)

### Components

#### `llvm_backend.mojo` - LLVM IR Generation
- Lowers MLIR to LLVM IR
- LLVM IR is compiled to machine code by LLVM compiler

**Lowering Process**:
```
MLIR → LLVM IR → Assembly → Machine Code
```

**Key Responsibilities**:
- Type representation (i32 → llvm.i32)
- Function calling conventions
- Memory layout (struct field offsets)
- Control flow (loops, branches)

#### `optimizer.mojo` - Optimization Passes
- Improves generated code
- Removes dead code
- Inlines functions
- Optimizes memory access

**Optimization Types**:
1. **Dead Code Elimination** - Remove unused variables
2. **Function Inlining** - Inline small functions
3. **Loop Optimizations** - Vectorization, unrolling
4. **Memory Optimizations** - Reduce allocations

## Phase 5: Runtime Support

**Files**: `src/runtime/` (3 files)

### Components

#### `memory.mojo` - Memory Management
- Allocation and deallocation
- Reference counting (for Python objects)
- Memory layout tracking

**Key Functions**:
```mojo
fn alloc(size: Int) -> Pointer[Any]:
    # Allocate memory

fn dealloc(ptr: Pointer[Any]):
    # Free memory

fn retain(ptr: Pointer[Any]):
    # Increment reference count

fn release(ptr: Pointer[Any]):
    # Decrement reference count
```

#### `reflection.mojo` - Runtime Reflection
- Type information at runtime
- Introspection capabilities
- Dynamic method resolution

**Use Cases**:
- Python interop (type marshalling)
- Debugging (inspecting values)
- Dynamic dispatch

#### `async_runtime.mojo` - Async/Await Support
- Event loop implementation
- Coroutine scheduling
- Promise/future handling

**Key Features**:
- Non-blocking I/O
- Concurrent task scheduling
- Error propagation in async chains

## Testing Strategy

**Test Files**: Located in `tests/` directory

### Test Categories

1. **Lexer Tests** (`test_lexer.mojo`)
   - Token recognition
   - Keyword handling
   - Error cases

2. **Parser Tests** (`test_parser.mojo`)
   - AST construction
   - Operator precedence
   - Error recovery

3. **Type Checker Tests** (`test_type_checker.mojo`)
   - Type inference
   - Compatibility checking
   - Error messages

4. **Phase-Specific Tests**:
   - `test_phase2_structs.mojo` - Struct handling
   - `test_phase3_traits.mojo` - Trait system
   - `test_phase3_iteration.mojo` - Loops
   - `test_phase4_generics.mojo` - Generic types
   - `test_phase4_ownership.mojo` - Ownership rules
   - `test_phase4_inference.mojo` - Type inference

5. **Backend Tests**:
   - `test_mlir_gen.mojo` - IR generation
   - `test_backend.mojo` - Code generation

6. **Integration Tests**:
   - `test_compiler_pipeline.mojo` - Full compilation
   - `test_control_flow.mojo` - Control structures
   - `test_operators.mojo` - Operator handling
   - `test_structs.mojo` - Struct definitions
   - `test_end_to_end.mojo` - Complete programs

### Running Tests

```bash
# Run all tests
pixi run test

# Run specific test
pixi run test -- tests/test_lexer.mojo

# Run with verbose output
pixi run test -- --verbose
```

## Development Workflow

### Adding a New Language Feature

1. **Update AST** (`frontend/ast.mojo`)
   - Add new node type for feature
   - Define node structure

2. **Update Parser** (`frontend/parser.mojo`)
   - Add parsing rule
   - Handle syntax for feature

3. **Update Type Checker** (`semantic/type_checker.mojo`)
   - Implement type checking logic
   - Add error messages

4. **Update IR Generation** (`ir/mlir_gen.mojo`)
   - Generate MLIR operations
   - Handle feature lowering

5. **Update Backend** (`codegen/llvm_backend.mojo`)
   - Generate LLVM IR
   - Handle calling conventions

6. **Add Tests**
   - Unit test in `tests/`
   - Example in `examples/`
   - Update integration tests

7. **Document**
   - Update this guide
   - Add docstring to new code
   - Update compiler README

### Code Organization Principles

1. **Separation of Concerns** - Each phase independent
2. **Clear Interfaces** - Minimal coupling between phases
3. **Comprehensive Tests** - Each module thoroughly tested
4. **Self-Documenting** - Code explains itself
5. **Error Handling** - Clear error messages for users

## Performance Considerations

### Compiler Speed

- **Lazy Analysis**: Only analyze used code paths
- **Caching**: Store type information
- **Parallel Compilation**: Future optimization

### Generated Code Speed

- **SIMD Generation**: Auto-vectorize loops
- **GPU Compilation**: Optimize kernels
- **Inlining**: Reduce function call overhead
- **Dead Code Elimination**: Remove unused operations

## Debugging

### Compiler Debugging

```bash
# Enable debug output (if compiled with debug info)
MOJO_DEBUG=1 pixi run compile

# Inspect AST
pixi run debug_ast file.mojo

# Inspect MLIR
pixi run debug_mlir file.mojo

# Inspect LLVM IR
pixi run debug_llvm file.mojo
```

### Error Messages

The compiler provides structured error messages:

```
error: Type mismatch
  file.mojo:10:5
    let x: i32 = "hello"
         ^^^ expected i32, got String
```

## Future Improvements

1. **Performance**
   - Parallel compilation phases
   - Incremental compilation
   - Better error recovery

2. **Features**
   - Pattern matching
   - Advanced generics
   - Macro system

3. **Tooling**
   - IDE support
   - Debugger
   - Performance profiler

---

**Last Updated**: January 23, 2026
**Architecture Version**: 1.0
**Status**: Production-ready (Phase 4 complete)
