"""
Main entry point for Mojo examples.
Demonstrates core Mojo features with strict typing.
"""

from math import sqrt


struct Vector3:
    """A 3D vector with strict typing."""
    var x: Float64
    var y: Float64
    var z: Float64

    fn __init__(inout self, x: Float64, y: Float64, z: Float64):
        self.x = x
        self.y = y
        self.z = z

    fn magnitude(self) -> Float64:
        return sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

    fn dot(self, other: Vector3) -> Float64:
        return self.x * other.x + self.y * other.y + self.z * other.z

    fn __str__(self) -> String:
        return "Vector3(" + str(self.x) + ", " + str(self.y) + ", " + str(self.z) + ")"


fn factorial(n: Int) -> Int:
    """Calculate factorial with strict Int typing."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)


fn fibonacci(n: Int) -> Int:
    """Calculate fibonacci number."""
    if n <= 1:
        return n
    var a: Int = 0
    var b: Int = 1
    for _ in range(2, n + 1):
        let temp = a + b
        a = b
        b = temp
    return b


fn main():
    print("=== Mojo Examples ===\n")

    # Strict typing demo
    print("-- Factorial --")
    for i in range(1, 11):
        print("factorial(" + str(i) + ") = " + str(factorial(i)))

    print("\n-- Fibonacci --")
    for i in range(1, 16):
        print("fib(" + str(i) + ") = " + str(fibonacci(i)))

    # Struct demo
    print("\n-- Vector3 --")
    let v1 = Vector3(1.0, 2.0, 3.0)
    let v2 = Vector3(4.0, 5.0, 6.0)

    print("v1 = " + str(v1))
    print("v2 = " + str(v2))
    print("v1.magnitude() = " + str(v1.magnitude()))
    print("v1.dot(v2) = " + str(v1.dot(v2)))

    print("\n=== Done ===")
