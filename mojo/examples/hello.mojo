"""
Hello World in Mojo - demonstrating basic syntax.
"""


fn greet(name: String) -> String:
    """Strictly typed greeting function."""
    return "Hello, " + name + "!"


fn main():
    # Basic print
    print("Hello, Mojo!")

    # Using typed function
    let message = greet("World")
    print(message)

    # Type inference with let (immutable)
    let x = 42  # Inferred as Int
    let pi = 3.14159  # Inferred as Float64
    let flag = True  # Inferred as Bool

    print("x = " + str(x))
    print("pi = " + str(pi))
    print("flag = " + str(flag))

    # Explicit typing with var (mutable)
    var counter: Int = 0
    for i in range(10):
        counter += i
    print("sum(0..9) = " + str(counter))
