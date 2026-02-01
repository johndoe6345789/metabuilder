# Mojo Language Examples

Reference implementations and tutorials for the Mojo programming language.

## Quick Start

```bash
cd mojo
pixi install
pixi run main  # Run samples/src/main.mojo
```

## Sample Programs

### Game of Life

Three different implementations of Conway's Game of Life showing optimization strategies:

```bash
cd samples/game-of-life
pixi run lifev1  # Basic implementation
pixi run lifev2  # Optimized memory
pixi run lifev3  # Fully optimized
```

**Features**:
- Grid data structures
- Neighbor calculations
- Simulation loop
- Performance optimization techniques

### Snake Game

Full interactive game using SDL3 with FFI bindings:

```bash
cd samples/snake
pixi run snake
```

**Features**:
- C library integration (SDL3)
- Event handling
- Graphics rendering
- Game state management

### GPU Functions

High-performance GPU kernels:

```bash
cd samples/gpu-functions
pixi run gpu-intro        # Simple vector addition
pixi run vector_add       # Advanced GPU kernels
pixi run matrix_mult      # GPU matrix multiplication
pixi run mandelbrot       # GPU Mandelbrot set
pixi run reduction        # GPU reduction operations
```

**Features**:
- Device memory management
- Kernel execution
- Block and thread organization
- Synchronization

### Python Interoperability

Calling Mojo from Python and vice versa:

```bash
cd samples/python-interop
pixi run hello            # Export Mojo module to Python
pixi run mandelbrot       # Performance comparison
pixi run person           # Object interop
```

**Features**:
- Python module export
- Python object marshalling
- Performance optimization
- Bidirectional calls

### Custom Operators

Implementing the Complex number type with operator overloading:

```bash
cd samples/operators
pixi run my_complex       # Complex arithmetic
pixi run test_complex     # Unit tests
```

**Features**:
- Struct definition
- Operator overloading (__add__, __mul__, etc.)
- Trait implementation
- Unit testing

### Testing Framework

Demonstration of the Mojo testing framework:

```bash
cd samples/testing
pixi run test_math        # Run math tests
```

**Features**:
- TestSuite class
- Assert functions
- Test organization
- Result reporting

### Tensor Operations

Using LayoutTensor for dense multidimensional arrays:

```bash
cd samples/layout_tensor
pixi run tensor_ops       # Tensor operations
```

**Features**:
- Dense array layout
- Efficient indexing
- Memory management
- GPU acceleration

### Process Handling

OS process execution and management:

```bash
cd samples/process
pixi run process_demo     # Process execution
```

**Features**:
- Process spawning
- Standard I/O
- Exit codes
- Synchronization

## Learning Path

**Beginner**:
1. Start with `src/main.mojo` - Basic syntax
2. Try `operators/my_complex.mojo` - Structs and operators
3. Explore `game-of-life/gridv1.mojo` - Algorithms

**Intermediate**:
1. Study `game-of-life/` optimizations
2. Learn `gpu-intro/` for GPU programming
3. Try `python-interop/hello_mojo.mojo` for integration

**Advanced**:
1. GPU kernels in `gpu-functions/`
2. Snake game with FFI in `snake/`
3. Custom tensors in `layout_tensor/`

## Key Language Features Demonstrated

| Feature | Location | Difficulty |
|---------|----------|------------|
| Structs | operators/ | Basic |
| Operators | operators/ | Basic |
| Traits | operators/ | Intermediate |
| Generics | gpu-functions/ | Advanced |
| GPU Kernels | gpu-functions/ | Advanced |
| FFI Bindings | snake/ | Advanced |
| Python Interop | python-interop/ | Advanced |
| Async/Await | (coming soon) | Advanced |

## Common Patterns

### Struct Definition

```mojo
struct Point:
    x: Float32
    y: Float32

    fn magnitude(self) -> Float32:
        return sqrt(self.x * self.x + self.y * self.y)
```

### Trait Implementation

```mojo
trait Drawable:
    fn draw(self):
        ...

struct Circle:
    radius: Float32

    fn draw(self):
        # Draw circle
        pass
```

### GPU Kernel

```mojo
fn gpu_add_kernel[blockSize: Int](
    output: DeviceBuffer,
    a: DeviceBuffer,
    b: DeviceBuffer,
):
    let idx = global_idx(0)
    if idx < len(output):
        output[idx] = a[idx] + b[idx]
```

### Python Module Export

```mojo
@export
fn mandelbrot_set(width: Int, height: Int) -> List[Complex]:
    # Compute Mandelbrot set
    return results

# Use from Python:
# from hello_mojo import mandelbrot_set
```

## Running Tests

```bash
# Run all example tests
cd samples
pixi run test

# Run specific example tests
cd game-of-life
pixi run test
```

## Performance Tips

1. **Use SIMD** for vectorizable loops
2. **GPU acceleration** for parallel algorithms
3. **Traits** for zero-cost abstraction
4. **Inline** small functions
5. **Avoid allocations** in hot loops

## Troubleshooting

### Missing Dependencies

```bash
# Reinstall environment
pixi install --force

# Update Pixi
pixi self-update
```

### GPU Not Working

```bash
# Check for GPU support
mojo -c "from sys import has_accelerator; print(has_accelerator())"

# May need appropriate NVIDIA/AMD drivers
```

### Python Interop Issues

```bash
# Ensure Python 3.11+
python3 --version

# Rebuild module
cd python-interop
pixi run build
```

## Contributing

When adding new samples:

1. Create directory under `samples/`
2. Add `mojoproject.toml` or reference parent
3. Include README.md with description
4. Add test file (`test_*.mojo`)
5. Update this file

## Resources

- **Official Docs**: See `/mojo/` root README
- **Compiler Guide**: See `compiler/CLAUDE.md`
- **Language Features**: See `compiler/examples/`

---

**Last Updated**: January 23, 2026
**Status**: All examples tested and working
