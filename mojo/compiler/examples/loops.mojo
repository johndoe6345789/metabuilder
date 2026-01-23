#!/usr/bin/env mojo
# Example: Loops - while and for

fn factorial(n: Int) -> Int:
    """Calculate factorial using a while loop."""
    var result = 1
    var i = 1
    while i <= n:
        result = result * i
        i = i + 1
    return result

fn sum_range(n: Int) -> Int:
    """Sum numbers from 0 to n using a for loop."""
    var total = 0
    for i in range(n + 1):
        total = total + i
    return total

fn fibonacci(n: Int) -> Int:
    """Calculate nth Fibonacci number."""
    if n <= 1:
        return n
    
    var a = 0
    var b = 1
    var i = 2
    while i <= n:
        let temp = a + b
        a = b
        b = temp
        i = i + 1
    return b

fn main():
    print("Factorial of 5:", factorial(5))
    print("Sum of 0 to 10:", sum_range(10))
    print("10th Fibonacci number:", fibonacci(10))
