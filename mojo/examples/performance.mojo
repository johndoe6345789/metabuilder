"""
Performance examples in Mojo - demonstrating systems-level speed.
"""

from time import now
from math import sqrt
from sys.info import simdwidthof


fn benchmark[func: fn() -> Int](name: String, iterations: Int):
    """Run a benchmark and print results."""
    let start = now()

    var result: Int = 0
    for _ in range(iterations):
        result = func()

    let elapsed = now() - start
    let elapsed_ms = Float64(elapsed) / 1_000_000.0

    print(name + ": " + str(elapsed_ms) + "ms (" + str(iterations) + " iterations)")
    print("  Result: " + str(result))
    print("  Per iteration: " + str(elapsed_ms / Float64(iterations) * 1000.0) + "μs")


fn naive_prime_count() -> Int:
    """Count primes up to N using naive method."""
    let n = 10000
    var count = 0

    for num in range(2, n):
        var is_prime = True
        for divisor in range(2, num):
            if num % divisor == 0:
                is_prime = False
                break
        if is_prime:
            count += 1

    return count


fn optimized_prime_count() -> Int:
    """Count primes using sqrt optimization."""
    let n = 10000
    var count = 0

    for num in range(2, n):
        var is_prime = True
        let limit = int(sqrt(Float64(num))) + 1

        for divisor in range(2, limit):
            if num % divisor == 0:
                is_prime = False
                break
        if is_prime:
            count += 1

    return count


fn matrix_multiply() -> Int:
    """Naive matrix multiplication benchmark."""
    let size = 100
    let a = DTypePointer[DType.float64].alloc(size * size)
    let b = DTypePointer[DType.float64].alloc(size * size)
    let c = DTypePointer[DType.float64].alloc(size * size)

    # Initialize
    for i in range(size * size):
        a.store(i, Float64(i % 10))
        b.store(i, Float64((i + 5) % 10))
        c.store(i, 0.0)

    # Multiply
    for i in range(size):
        for j in range(size):
            var sum: Float64 = 0.0
            for k in range(size):
                sum += a.load(i * size + k) * b.load(k * size + j)
            c.store(i * size + j, sum)

    let result = int(c.load(0) + c.load(size * size - 1))

    a.free()
    b.free()
    c.free()

    return result


fn fibonacci_iterative() -> Int:
    """Fibonacci using iteration."""
    let n = 40
    var a: Int = 0
    var b: Int = 1

    for _ in range(2, n + 1):
        let temp = a + b
        a = b
        b = temp

    return b


fn array_sum_simd() -> Int:
    """Sum large array using SIMD."""
    alias simd_width = simdwidthof[DType.int64]()
    let size = 100000
    let data = DTypePointer[DType.int64].alloc(size)

    # Initialize
    for i in range(size):
        data.store(i, Int64(i + 1))

    # SIMD sum
    var total: Int64 = 0
    let simd_end = size - (size % simd_width)

    for i in range(0, simd_end, simd_width):
        let chunk = data.load[width=simd_width](i)
        total += chunk.reduce_add()

    for i in range(simd_end, size):
        total += data.load(i)

    data.free()
    return int(total)


fn main():
    print("=== Performance Benchmarks ===\n")
    print("System SIMD width: " + str(simdwidthof[DType.float64]()) + " (float64)")
    print("")

    benchmark[naive_prime_count]("Naive prime count (to 10K)", 10)
    print("")

    benchmark[optimized_prime_count]("Optimized prime count (to 10K)", 100)
    print("")

    benchmark[matrix_multiply]("Matrix multiply (100x100)", 10)
    print("")

    benchmark[fibonacci_iterative]("Fibonacci(40) iterative", 100000)
    print("")

    benchmark[array_sum_simd]("SIMD array sum (100K elements)", 1000)

    print("\n=== Done ===")
