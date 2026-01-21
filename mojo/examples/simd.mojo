"""
SIMD examples in Mojo - demonstrating vectorized operations.
"""

from math import sqrt
from sys.info import simdwidthof


fn vector_add[width: Int](
    a: SIMD[DType.float64, width],
    b: SIMD[DType.float64, width]
) -> SIMD[DType.float64, width]:
    """Add two SIMD vectors."""
    return a + b


fn vector_dot[width: Int](
    a: SIMD[DType.float64, width],
    b: SIMD[DType.float64, width]
) -> Float64:
    """Compute dot product of two SIMD vectors."""
    return (a * b).reduce_add()


fn vector_magnitude[width: Int](v: SIMD[DType.float64, width]) -> Float64:
    """Compute magnitude of a SIMD vector."""
    return sqrt(vector_dot(v, v))


fn normalize[width: Int](
    v: SIMD[DType.float64, width]
) -> SIMD[DType.float64, width]:
    """Normalize a SIMD vector."""
    let mag = vector_magnitude(v)
    return v / mag


fn sum_array(data: DTypePointer[DType.float64], size: Int) -> Float64:
    """Sum array using SIMD for performance."""
    alias simd_width = simdwidthof[DType.float64]()
    var total: Float64 = 0.0

    # Process in SIMD chunks
    let simd_end = size - (size % simd_width)
    for i in range(0, simd_end, simd_width):
        let chunk = data.load[width=simd_width](i)
        total += chunk.reduce_add()

    # Handle remainder
    for i in range(simd_end, size):
        total += data.load(i)

    return total


fn main():
    print("=== SIMD Examples ===\n")

    # Basic SIMD operations
    print("-- 4-wide SIMD vectors --")
    let a = SIMD[DType.float64, 4](1.0, 2.0, 3.0, 4.0)
    let b = SIMD[DType.float64, 4](5.0, 6.0, 7.0, 8.0)

    print("a = " + str(a))
    print("b = " + str(b))
    print("a + b = " + str(vector_add(a, b)))
    print("a · b = " + str(vector_dot(a, b)))
    print("|a| = " + str(vector_magnitude(a)))
    print("normalize(a) = " + str(normalize(a)))

    # System SIMD width
    alias native_width = simdwidthof[DType.float64]()
    print("\n-- System Info --")
    print("Native SIMD width for Float64: " + str(native_width))

    # Performance demonstration
    print("\n-- Array Sum with SIMD --")
    let size = 1000
    let data = DTypePointer[DType.float64].alloc(size)

    # Initialize array
    for i in range(size):
        data.store(i, Float64(i + 1))

    let total = sum_array(data, size)
    print("sum(1.." + str(size) + ") = " + str(total))
    print("expected = " + str(Float64(size * (size + 1)) / 2.0))

    data.free()
    print("\n=== Done ===")
