# ===----------------------------------------------------------------------=== #
# Copyright (c) 2025, Modular Inc. All rights reserved.
#
# Licensed under the Apache License v2.0 with LLVM Exceptions:
# https://llvm.org/LICENSE.txt
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ===----------------------------------------------------------------------=== #

"""Example: Type Inference (Phase 4 Feature).

This example demonstrates:
- Variable type inference from initializers
- Function return type inference
- Generic type parameter inference
- Expression type inference
"""


fn add(a: Int, b: Int):
    """Add two integers with inferred return type.
    
    Args:
        a: First integer.
        b: Second integer.
        
    Returns:
        The sum (type inferred as Int).
    """
    return a + b


fn greet(name: String):
    """Greet someone with inferred return type.
    
    Args:
        name: The person's name.
        
    Returns:
        Greeting message (type inferred as String).
    """
    return "Hello, " + name + "!"


fn is_positive(x: Int):
    """Check if a number is positive with inferred return type.
    
    Args:
        x: The number to check.
        
    Returns:
        True if positive (type inferred as Bool).
    """
    return x > 0


fn max[T](a: T, b: T) -> T:
    """Generic max function with type parameter inference.
    
    Args:
        a: First value.
        b: Second value.
        
    Returns:
        The larger value.
    """
    if a > b:
        return a
    else:
        return b


fn main():
    """Demonstrate type inference."""
    
    # Variable type inference from literals
    var x = 42  # Inferred as Int
    var y = 3.14  # Inferred as Float64
    var name = "Alice"  # Inferred as String
    var flag = True  # Inferred as Bool
    
    print("Inferred types:")
    print("x =", x, "(Int)")
    print("y =", y, "(Float64)")
    print("name =", name, "(String)")
    print("flag =", flag, "(Bool)")
    
    # Type inference from expressions
    var sum = x + 10  # Inferred as Int
    var product = x * 2  # Inferred as Int
    var comparison = x > 10  # Inferred as Bool
    
    print("\nExpression inference:")
    print("sum =", sum, "(Int)")
    print("product =", product, "(Int)")
    print("comparison =", comparison, "(Bool)")
    
    # Function return type inference
    var result1 = add(5, 7)  # Inferred as Int
    var result2 = greet("Bob")  # Inferred as String
    var result3 = is_positive(-5)  # Inferred as Bool
    
    print("\nFunction return inference:")
    print("add result =", result1, "(Int)")
    print("greet result =", result2, "(String)")
    print("is_positive result =", result3, "(Bool)")
    
    # Generic type parameter inference
    var max_int = max(10, 20)  # T inferred as Int
    var max_float = max(3.14, 2.71)  # T inferred as Float64
    var max_string = max("apple", "banana")  # T inferred as String
    
    print("\nGeneric parameter inference:")
    print("max(10, 20) =", max_int, "(T = Int)")
    print("max(3.14, 2.71) =", max_float, "(T = Float64)")
    print("max strings =", max_string, "(T = String)")
    
    # Complex expression inference
    var complex = (x + 5) * 2 - 10  # Inferred as Int
    var condition = (x > 0) and (y < 10.0)  # Inferred as Bool
    
    print("\nComplex expression inference:")
    print("complex =", complex, "(Int)")
    print("condition =", condition, "(Bool)")
    
    # Let bindings with inference
    let constant = 100  # Inferred as Int (immutable)
    let pi = 3.14159  # Inferred as Float64 (immutable)
    
    print("\nLet binding inference:")
    print("constant =", constant, "(Int)")
    print("pi =", pi, "(Float64)")
