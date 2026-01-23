#!/usr/bin/env mojo
# Example: Comprehensive demonstration of Phase 2 operators

fn absolute_value(x: Int) -> Int:
    """Return the absolute value of an integer."""
    if x < 0:
        return -x
    else:
        return x

fn is_in_range(x: Int, min: Int, max: Int) -> Int:
    """Check if x is in the range [min, max]."""
    if x >= min && x <= max:
        return 1
    else:
        return 0

fn classify_triangle(a: Int, b: Int, c: Int) -> String:
    """Classify a triangle by its sides."""
    if a == b && b == c:
        return "equilateral"
    elif a == b || b == c || a == c:
        return "isosceles"
    else:
        return "scalene"

fn is_valid_triangle(a: Int, b: Int, c: Int) -> Int:
    """Check if three sides can form a valid triangle."""
    if a > 0 && b > 0 && c > 0:
        if (a + b > c) && (b + c > a) && (a + c > b):
            return 1
    return 0

fn sign(x: Int) -> Int:
    """Return the sign of x: -1, 0, or 1."""
    if x < 0:
        return -1
    elif x > 0:
        return 1
    else:
        return 0

fn bitwise_not_example(x: Int) -> Int:
    """Demonstrate bitwise NOT operator."""
    return ~x

fn logical_not_example(a: Int, b: Int) -> Int:
    """Demonstrate logical NOT operator."""
    if !(a > b):
        return 1
    else:
        return 0

fn complex_condition(a: Int, b: Int, c: Int) -> Int:
    """Complex boolean expression with multiple operators."""
    if (a > 0 && b > 0) || (c < 0):
        if !(a == b):
            return 1
    return 0

fn main():
    """Demonstrate all Phase 2 operators."""
    print("=== Phase 2 Operator Examples ===\n")
    
    # Comparison operators
    print("Comparison Operators:")
    print("absolute_value(-42):", absolute_value(-42))
    print("is_in_range(5, 0, 10):", is_in_range(5, 0, 10))
    print("is_in_range(15, 0, 10):", is_in_range(15, 0, 10))
    print()
    
    # Boolean operators
    print("Boolean Operators:")
    print("is_valid_triangle(3, 4, 5):", is_valid_triangle(3, 4, 5))
    print("is_valid_triangle(1, 2, 10):", is_valid_triangle(1, 2, 10))
    print()
    
    # String results
    print("Classification:")
    print("Triangle (5, 5, 5):", classify_triangle(5, 5, 5))
    print("Triangle (5, 5, 3):", classify_triangle(5, 5, 3))
    print("Triangle (3, 4, 5):", classify_triangle(3, 4, 5))
    print()
    
    # Unary operators
    print("Unary Operators:")
    print("sign(-10):", sign(-10))
    print("sign(0):", sign(0))
    print("sign(10):", sign(10))
    print("bitwise_not(5):", bitwise_not_example(5))
    print("logical_not(10, 5):", logical_not_example(10, 5))
    print("logical_not(5, 10):", logical_not_example(5, 10))
    print()
    
    # Complex conditions
    print("Complex Conditions:")
    print("complex_condition(1, 2, -3):", complex_condition(1, 2, -3))
    print("complex_condition(1, 1, 5):", complex_condition(1, 1, 5))
