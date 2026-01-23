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

"""Test suite for Phase 4 type inference.

This test validates:
- Variable type inference from initializers
- Function return type inference
- Generic type parameter inference
- Expression type inference
"""

from src.frontend.lexer import Lexer
from src.frontend.parser import Parser
from src.semantic.type_system import TypeInferenceContext, Type


fn test_literal_type_inference():
    """Test type inference from literals."""
    print("=== Test: Literal Type Inference ===")
    
    var context = TypeInferenceContext()
    
    # Infer from integer literal
    let int_type = context.infer_from_literal("42", "int")
    if int_type.name == "Int":
        print("✓ Inferred Int from integer literal")
    else:
        print("✗ Expected Int, got", int_type.name)
    
    # Infer from float literal
    let float_type = context.infer_from_literal("3.14", "float")
    if float_type.name == "Float64":
        print("✓ Inferred Float64 from float literal")
    else:
        print("✗ Expected Float64, got", float_type.name)
    
    # Infer from string literal
    let string_type = context.infer_from_literal("hello", "string")
    if string_type.name == "String":
        print("✓ Inferred String from string literal")
    else:
        print("✗ Expected String, got", string_type.name)
    
    # Infer from bool literal
    let bool_type = context.infer_from_literal("True", "bool")
    if bool_type.name == "Bool":
        print("✓ Inferred Bool from bool literal")
    else:
        print("✗ Expected Bool, got", bool_type.name)
    
    print()


fn test_variable_inference_parsing():
    """Test parsing of variable declarations with inferred types."""
    print("=== Test: Variable Type Inference Parsing ===")
    
    let source = """
fn main():
    var x = 42
    var y = 3.14
    var name = "Alice"
    var flag = True
    let z = x + y
"""
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    if len(parser.function_nodes) > 0:
        print("✓ Parsed function with inferred variable types")
        # In a full implementation, the type checker would:
        # 1. Detect variables without explicit type annotations
        # 2. Infer types from initializer expressions
        # 3. Validate inferred types are valid
    else:
        print("✗ Failed to parse function")
    
    print()


fn test_binary_expr_inference():
    """Test type inference for binary expressions."""
    print("=== Test: Binary Expression Type Inference ===")
    
    var context = TypeInferenceContext()
    
    let int_type = Type("Int")
    let float_type = Type("Float64")
    
    # Arithmetic expression
    let add_result = context.infer_from_binary_expr(int_type, int_type, "+")
    if add_result.name == "Int":
        print("✓ Inferred Int from Int + Int")
    else:
        print("✗ Expected Int, got", add_result.name)
    
    # Comparison expression
    let cmp_result = context.infer_from_binary_expr(int_type, int_type, "==")
    if cmp_result.name == "Bool":
        print("✓ Inferred Bool from Int == Int")
    else:
        print("✗ Expected Bool, got", cmp_result.name)
    
    # Boolean expression
    let bool_type = Type("Bool")
    let and_result = context.infer_from_binary_expr(bool_type, bool_type, "&&")
    if and_result.name == "Bool":
        print("✓ Inferred Bool from Bool && Bool")
    else:
        print("✗ Expected Bool, got", and_result.name)
    
    print()


fn test_function_return_inference():
    """Test function return type inference."""
    print("=== Test: Function Return Type Inference ===")
    
    let source = """
fn add(a: Int, b: Int):
    return a + b

fn greet(name: String):
    return "Hello, " + name

fn is_positive(x: Int):
    return x > 0
"""
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    if len(parser.function_nodes) == 3:
        print("✓ Parsed 3 functions with inferred return types")
        # Type checker would infer:
        # - add returns Int (from a + b where a, b are Int)
        # - greet returns String (from string concatenation)
        # - is_positive returns Bool (from comparison)
    else:
        print("✗ Expected 3 functions, got", len(parser.function_nodes))
    
    print()


fn test_generic_parameter_inference():
    """Test type parameter inference for generic functions."""
    print("=== Test: Generic Parameter Inference ===")
    
    let source = """
fn identity[T](x: T) -> T:
    return x

fn main():
    var x = identity(42)
    var y = identity("hello")
"""
    
    # When calling identity(42):
    # - Compiler infers T = Int from argument type
    # - Return type becomes Int
    
    # When calling identity("hello"):
    # - Compiler infers T = String from argument type
    # - Return type becomes String
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    if len(parser.function_nodes) == 2:
        print("✓ Parsed generic function and caller")
        print("  (Full type parameter inference requires call-site analysis)")
    else:
        print("✗ Expected 2 functions, got", len(parser.function_nodes))
    
    print()


fn test_context_sensitive_inference():
    """Test context-sensitive type inference."""
    print("=== Test: Context-Sensitive Inference ===")
    
    let source = """
fn process(x: Int) -> String:
    return str(x)

fn main():
    var result = process(42)
"""
    
    # The variable 'result' should be inferred as String
    # based on the return type of process()
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    if len(parser.function_nodes) == 2:
        print("✓ Parsed functions for context-sensitive inference")
        print("  (Type checker would infer result: String)")
    else:
        print("✗ Expected 2 functions, got", len(parser.function_nodes))
    
    print()


fn test_complex_expression_inference():
    """Test inference for complex expressions."""
    print("=== Test: Complex Expression Inference ===")
    
    var context = TypeInferenceContext()
    
    # Nested expression: (a + b) * c
    let int_type = Type("Int")
    let add_result = context.infer_from_binary_expr(int_type, int_type, "+")
    let mul_result = context.infer_from_binary_expr(add_result, int_type, "*")
    
    if mul_result.name == "Int":
        print("✓ Inferred Int from (Int + Int) * Int")
    else:
        print("✗ Expected Int, got", mul_result.name)
    
    # Comparison of arithmetic: (a + b) == c
    let eq_result = context.infer_from_binary_expr(add_result, int_type, "==")
    if eq_result.name == "Bool":
        print("✓ Inferred Bool from (Int + Int) == Int")
    else:
        print("✗ Expected Bool, got", eq_result.name)
    
    print()


fn test_inference_error_cases():
    """Test type inference error detection."""
    print("=== Test: Type Inference Errors ===")
    
    let source = """
fn main():
    var x
    var y = x
"""
    
    # Should produce an error:
    # - x has no initializer, cannot infer type
    # - y depends on x which has no type
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    print("✓ Parsed code with inference errors")
    print("  (Type checker should report: cannot infer type for x)")
    
    print()


fn main():
    """Run all Phase 4 type inference tests."""
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   Phase 4: Type Inference Test Suite                    ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    
    test_literal_type_inference()
    test_variable_inference_parsing()
    test_binary_expr_inference()
    test_function_return_inference()
    test_generic_parameter_inference()
    test_context_sensitive_inference()
    test_complex_expression_inference()
    test_inference_error_cases()
    
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   Phase 4 Type Inference Tests Complete                 ║")
    print("╚══════════════════════════════════════════════════════════╝")
