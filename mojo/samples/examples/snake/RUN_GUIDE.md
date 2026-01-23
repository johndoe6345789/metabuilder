# SDL3 Snake Game - Running Guide

## Running with MetaBuilder Mojo Compiler

```bash
cd mojo/samples/examples/snake
../../compiler/src/__init__.mojo snake.mojo
```

Or run through the MetaBuilder test framework:

```bash
cd mojo
pixi install
pixi run test tests/test_*.mojo
```

## What This Is

A complete Snake game written in pure Mojo demonstrating MetaBuilder's own compiler capabilities:

- ✅ Full game mechanics (movement, collision, food)
- ✅ SDL3 graphics rendering (via FFI)
- ✅ Keyboard input handling (arrow keys + ESC to quit)
- ✅ SIMD-optimized structures
- ✅ Pure Mojo - compiled by our custom compiler
- ✅ Tests compiler's FFI, struct, and game loop handling

## How It Tests the Compiler

This snake game exercises all 5 compiler phases:

### 1. Frontend (Lexer & Parser)
- Tokenizes snake.mojo and sdl3.mojo
- Builds AST for all language constructs
- Validates syntax

### 2. Semantic Analysis (Type Checking)
- Verifies struct definitions (SDL_Event, Color, Direction)
- Type-checks FFI calls to SDL3
- Validates ownership and borrowing
- Resolves all symbol references

### 3. IR Generation
- Converts AST to MLIR representation
- Generates MLIR for game loop
- Handles SIMD operations in SDL_Event

### 4. Code Generation (LLVM Backend)
- Lowers MLIR to LLVM IR
- Optimizes event loop
- Generates efficient FFI call wrappers

### 5. Runtime Support
- Memory management for game state
- Reflection for debugging
- Async event handling

## Architecture

**sdl3.mojo** (250+ lines)
- SDL3 FFI bindings using `sys.ffi`
- Opaque pointer types (SDL_Window, SDL_Renderer)
- Event handling (keyboard, quit)
- Color and rendering calls
- **Compiler tests**: FFI binding generation, unsafe pointers, comptime constants

**snake.mojo** (340+ lines)
- Game state management
- Snake body tracking (List of positions)
- Food spawning (random placement)
- Collision detection
- Rendering pipeline
- Event loop
- **Compiler tests**: Structs, enums, pattern matching, SIMD usage

## Key Mojo Features Demonstrated

1. **FFI Bindings** - Direct C library integration
   ```mojo
   comptime SDL3_LIB_PATH = "/path/to/libSDL3.dylib"
   # Compiler must resolve this at compile time

   fn load_sdl3() -> SDL3:
       return SDL3(OwnedDLHandle(SDL3_LIB_PATH))
   ```

2. **SIMD Structures** - Efficient memory layout validation
   ```mojo
   @register_passable("trivial")
   struct SDL_Event:
       var _low: SIMD[DType.uint64, 8]   # 64 bytes
       var _high: SIMD[DType.uint64, 8]  # 64 bytes
   # Compiler verifies register passable layout
   ```

3. **Unsafe Pointers** - Type safety at compile time
   ```mojo
   var window: SDL_Window = sdl.create_window()
   # Compiler tracks opaque type through FFI boundary
   ```

4. **Pattern Matching** - Control flow type checking
   ```mojo
   fn get_delta(self) -> (Int, Int):
       if self == Direction.UP:
           return (0, -1)
       elif self == Direction.DOWN:
           return (0, 1)
       # Compiler verifies all branches return correct type
   ```

5. **Ownership System** - Memory safety validation
   ```mojo
   var snake_body: List[Position]
   # Compiler ensures List lifetime and RAII semantics
   ```

## Compilation Steps

The MetaBuilder compiler processes snake.mojo through 5 distinct phases:

### Step 1: Lexical Analysis
```
snake.mojo (text) → Lexer → Tokens
```

### Step 2: Syntactic Analysis
```
Tokens → Parser → AST
```

### Step 3: Semantic Analysis
```
AST → Type Checker → Validated AST + Symbol Table
```

### Step 4: IR Generation
```
Validated AST → MLIR Generator → MLIR Code
```

### Step 5: Code Generation
```
MLIR → LLVM Backend → LLVM IR → (can be compiled to native via LLVM)
```

## Testing the Compiler with Snake

Run compiler tests that use snake game as example:

```bash
cd mojo

# Test lexer on snake.mojo
pixi run test tests/test_lexer.mojo

# Test parser on snake.mojo
pixi run test tests/test_parser.mojo

# Test type checker on snake.mojo
pixi run test tests/test_type_checker.mojo

# Test full compiler pipeline with snake.mojo
pixi run test tests/test_compiler_pipeline.mojo

# Test FFI integration (sdl3.mojo specific)
pixi run test tests/test_backend.mojo
```

## Code Structure

```
sdl3.mojo (FFI Bindings)
├── Constants (SDL flags, events, scancodes)
├── Structs (SDL_FRect, SDL_Event with SIMD)
├── FFI bindings (CreateWindow, PollEvent, DrawRect, etc.)
└── SDL3 wrapper class

snake.mojo (Game Logic)
├── Game constants (grid size: 20x30, speed: 100ms)
├── Color definitions (register_passable structs)
├── Direction enum (UP, DOWN, LEFT, RIGHT)
├── GameState struct (snake position, food position, score)
├── Main game loop (event handling → update → render)
├── Render functions (background, grid, food, snake)
└── Event handling (keyboard input processing)
```

## Game Controls

- **Arrow Keys**: Move snake (Up/Down/Left/Right)
- **ESC**: Quit game
- **Auto-restart**: Game over → Press any key to restart

## Gameplay

1. Snake starts in center
2. Food appears randomly on grid
3. Snake eats food to grow
4. Cannot eat itself
5. Cannot go off-screen
6. Game speeds up slightly on each food eaten

## Performance Characteristics

- **60 FPS target rendering** (16ms per frame)
- **Game update every 100ms** (game logic timestep)
- **Minimal allocations** (snake body uses pre-allocated List)
- **SIMD-optimized structures** (SDL_Event uses SIMD vectors)
- **Compiler optimization passes** applied during codegen phase

## Compiler Validation

This snake game validates:

✅ **Lexer**: Tokenizes complex syntax (FFI, SIMD, structs, comptime)
✅ **Parser**: Builds AST for game logic and FFI bindings
✅ **Type System**: Validates struct layouts, SIMD operations, ownership
✅ **IR Generation**: Produces correct MLIR for game loop
✅ **Codegen**: Generates efficient LLVM IR
✅ **Runtime**: Memory management for game state

## Troubleshooting

### "Lexer error: unknown token"
- Ensure sdl3.mojo uses valid Mojo syntax
- Check comptime constants are properly formatted
- Run lexer tests: `pixi run test tests/test_lexer.mojo`

### "Type mismatch in FFI call"
- Compiler's type checker caught SDL function signature mismatch
- Verify FFI binding matches C library
- Check OwnedDLHandle usage

### "SIMD layout incorrect"
- Compiler validates register_passable struct layout
- SDL_Event must be exactly 128 bytes (2x 64-byte SIMD)
- Check @register_passable("trivial") annotation

### Parser error on Direction enum
- Verify enum variant syntax matches compiler expectations
- Check comparison operators (==, !=) are type-correct
- Run parser tests: `pixi run test tests/test_phase2_structs.mojo`

## Learning from the Code

Study these files to understand:

**sdl3.mojo** - How to:
- Write FFI bindings
- Use comptime constants
- Define opaque types
- Handle C struct layout

**snake.mojo** - How to:
- Implement game loops
- Use custom structs and enums
- Manage game state
- Implement pattern matching
- Use SIMD and unsafe pointers

**Compiler tests** - How the compiler handles:
- Lexical analysis (test_lexer.mojo)
- Parsing complex syntax (test_parser.mojo)
- Type inference (test_phase4_inference.mojo)
- FFI integration (test_backend.mojo)

## Next Steps

1. **Run the compiler** on snake.mojo and observe all 5 phases
2. **Study the test files** to see compiler validation
3. **Extend the game** (add score display, difficulty levels)
4. **Add new features** (test compiler's handling of new constructs)
5. **Optimize the code** (study codegen phase optimizations)

## Files Reference

```
Compiler:           mojo/compiler/src/
  - frontend/       Lexer, parser, AST
  - semantic/       Type system, checker
  - ir/             MLIR generation
  - codegen/        LLVM backend
  - runtime/        Memory, reflection

Game:               mojo/samples/examples/snake/
  - snake.mojo      Main game (340 lines)
  - sdl3.mojo       FFI bindings (250 lines)
  - pixi.toml       Build config

Tests:              mojo/compiler/tests/
  - test_lexer.mojo
  - test_parser.mojo
  - test_type_checker.mojo
  - test_compiler_pipeline.mojo
```

---

**Status**: Production Ready ✅
**Compiler**: MetaBuilder Mojo (5 phases, fully implemented)
**Game**: SDL3 Snake (full FFI + game logic)
**Last Updated**: January 23, 2026
**Author**: MetaBuilder Contributors
