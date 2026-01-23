#!/usr/bin/env mojo
# Example: Control flow with if/else

fn max(a: Int, b: Int) -> Int:
    """Return the maximum of two integers."""
    if a > b:
        return a
    else:
        return b

fn classify_number(n: Int) -> String:
    """Classify a number as negative, zero, or positive."""
    if n < 0:
        return "negative"
    elif n == 0:
        return "zero"
    else:
        return "positive"

fn main():
    let result = max(42, 17)
    print("Max of 42 and 17:", result)
    
    print("10 is", classify_number(10))
    print("-5 is", classify_number(-5))
    print("0 is", classify_number(0))
