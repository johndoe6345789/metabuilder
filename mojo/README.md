# Mojo Examples

Example projects demonstrating Mojo - a new programming language that combines Python syntax with systems programming performance.

## Why Mojo?

- **Python-like syntax** - Familiar to Python developers
- **Strictly typed** - Compile-time type checking
- **Systems performance** - Comparable to C/C++/Rust
- **Python interop** - Import and use Python libraries
- **SIMD & parallelism** - First-class support for vectorization

## Requirements

- [Mojo SDK](https://www.modular.com/mojo) (free to download)

## Project Structure

```
mojo/
├── src/
│   └── main.mojo          # Main entry point
├── examples/
│   ├── hello.mojo         # Hello world
│   ├── structs.mojo       # Struct definitions
│   ├── simd.mojo          # SIMD operations
│   ├── python_interop.mojo # Python integration
│   └── performance.mojo   # Performance comparison
└── mojoproject.toml       # Project configuration
```

## Quick Start

```bash
# Run hello world
mojo examples/hello.mojo

# Build optimized binary
mojo build src/main.mojo -o main

# Run with Python interop
mojo examples/python_interop.mojo
```

## Key Features Demonstrated

### Strict Typing
```mojo
fn add(x: Int, y: Int) -> Int:
    return x + y
```

### Structs with Ownership
```mojo
struct Point:
    var x: Float64
    var y: Float64

    fn __init__(inout self, x: Float64, y: Float64):
        self.x = x
        self.y = y
```

### SIMD Operations
```mojo
from math import sqrt

fn vector_magnitude[width: Int](v: SIMD[DType.float64, width]) -> Float64:
    return sqrt((v * v).reduce_add())
```

### Python Interop
```mojo
from python import Python

fn main() raises:
    let np = Python.import_module("numpy")
    let arr = np.array([1, 2, 3, 4, 5])
    print(arr.mean())
```

## Resources

- [Mojo Documentation](https://docs.modular.com/mojo/)
- [Mojo Playground](https://playground.modular.com/)
- [Modular Community](https://www.modular.com/community)
