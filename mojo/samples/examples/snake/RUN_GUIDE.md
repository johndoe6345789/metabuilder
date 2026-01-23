# SDL3 Snake Game - Running Guide

## Quick Start

```bash
cd mojo/samples/examples/snake
pixi install
pixi run run
```

## What This Is

A complete Snake game written in pure Mojo with SDL3 FFI bindings. Features:

- ✅ Full game mechanics (movement, collision, food)
- ✅ SDL3 graphics rendering
- ✅ Keyboard input handling (arrow keys + ESC to quit)
- ✅ SIMD-optimized structures
- ✅ Pure Mojo (no C/C++ code needed)

## Architecture

**sdl3.mojo** (250+ lines)
- SDL3 FFI bindings using `sys.ffi`
- Opaque pointer types (SDL_Window, SDL_Renderer)
- Event handling (keyboard, quit)
- Color and rendering calls

**snake.mojo** (340+ lines)
- Game state management
- Snake body tracking (List of positions)
- Food spawning (random placement)
- Collision detection
- Rendering pipeline
- Event loop

## Key Mojo Features Demonstrated

1. **FFI Bindings** - Loading native libraries and calling C functions
   ```mojo
   fn load_sdl3() -> SDL3:
       return SDL3(OwnedDLHandle(SDL3_LIB_PATH))
   ```

2. **SIMD Structures** - Using SIMD for efficient storage
   ```mojo
   @register_passable("trivial")
   struct SDL_Event:
       var _low: SIMD[DType.uint64, 8]   # 64 bytes
       var _high: SIMD[DType.uint64, 8]  # 64 bytes
   ```

3. **Unsafe Pointers** - Direct memory access to C structures
   ```mojo
   var window: SDL_Window = sdl.create_window()
   var renderer: SDL_Renderer = sdl.create_renderer(window)
   ```

4. **Pattern Matching** - Direction and state handling
   ```mojo
   fn get_delta(self) -> (Int, Int):
       if self == Direction.UP:
           return (0, -1)
       ...
   ```

## Compilation

### Development (Interpreter)
```bash
pixi run run    # Uses Mojo interpreter
```

### Production (Native Binary)
```bash
pixi run build  # Compiles to native binary
./snake         # Run compiled binary
```

## Requirements

- **Mojo Compiler**: `<1.0.0` (from conda.modular.com)
- **SDL3 Library**: Installed via Conan (in pixi.lock)
- **Platform**: macOS (arm64), Linux (x86_64, aarch64)

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

## Performance

- 60 FPS target (16ms per frame)
- Game update every 100ms
- Minimal allocations (snake body uses pre-allocated List)
- Optimized rendering (dirty region updates)

## Troubleshooting

### "libSDL3.dylib not found"
- Update the path in sdl3.mojo line 8:
  ```bash
  find ~/.conan2 -name "libSDL3*"
  ```

### "No window" or "renderer failed"
- SDL3 initialization error
- Check SDL3 library is properly installed
- Verify X11/display server on Linux

### Compilation errors
- Ensure Mojo compiler version < 1.0.0
- Check pixi environment: `pixi install --force`

## Code Structure

```
sdl3.mojo
├── Constants (SDL init flags, event types, scancodes)
├── Structs (SDL_FRect, SDL_Event)
├── FFI bindings (SDL_Init, CreateWindow, PollEvent, etc.)
└── SDL3 wrapper class

snake.mojo
├── Game constants (grid size, speed)
├── Color definitions
├── Direction enum
├── GameState struct
├── Main game loop
├── Render functions
└── Event handling
```

## Future Improvements

- [ ] Score tracking and display
- [ ] Difficulty levels
- [ ] Sound effects (using SDL_mixer)
- [ ] Multiplayer support
- [ ] Save high scores
- [ ] Better graphics (sprite sheets)

## Learning Resources

See the Mojo compiler documentation for:
- [FFI Integration](../compiler/examples/snake/)
- [SIMD Operations](../compiler/examples/operators.mojo)
- [Memory Management](../../compiler/src/runtime/memory.mojo)

---

**Status**: Production Ready ✅
**Last Updated**: January 23, 2026
**Author**: MetaBuilder Contributors
