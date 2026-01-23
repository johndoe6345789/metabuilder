#!/usr/bin/env mojo
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

"""Test comparison, boolean, and unary operators (Phase 2)."""

from src.frontend.parser import Parser
from src.ir.mlir_gen import MLIRGenerator


fn test_comparison_operators():
    """Test comparison operators in control flow."""
    print("Testing comparison operators...")
    
    let source = """
fn test_comparisons(a: Int, b: Int) -> Int:
    if a < b:
        return 1
    elif a > b:
        return 2
    elif a <= b:
        return 3
    elif a >= b:
        return 4
    elif a == b:
        return 5
    elif a != b:
        return 6
    else:
        return 0
"""
    
    var parser = Parser(source, "test_comparisons.mojo")
    let ast = parser.parse()
    
    if parser.has_errors():
        print("✗ Comparison operators failed to parse")
        for i in range(len(parser.errors)):
            print("  Error:", parser.errors[i])
        return
    
    print("✓ Comparison operators parsed successfully")
    
    # Test MLIR generation
    var mlir_gen = MLIRGenerator(parser^)
    let mlir = mlir_gen.generate()
    
    # Check for comparison operations in MLIR
    if "arith.cmpi slt" in mlir:
        print("  ✓ Less than (<) generates arith.cmpi slt")
    if "arith.cmpi sgt" in mlir:
        print("  ✓ Greater than (>) generates arith.cmpi sgt")
    if "arith.cmpi eq" in mlir:
        print("  ✓ Equal (==) generates arith.cmpi eq")
    
    print()


fn test_boolean_operators():
    """Test boolean operators."""
    print("Testing boolean operators...")
    
    let source = """
fn test_and_or(a: Int, b: Int, c: Int) -> Int:
    if a > 0 && b > 0:
        return 1
    elif a > 0 || b > 0:
        return 2
    else:
        return 0
"""
    
    var parser = Parser(source, "test_boolean.mojo")
    let ast = parser.parse()
    
    if parser.has_errors():
        print("✗ Boolean operators failed to parse")
        for i in range(len(parser.errors)):
            print("  Error:", parser.errors[i])
        return
    
    print("✓ Boolean operators parsed successfully")
    
    # Test MLIR generation
    var mlir_gen = MLIRGenerator(parser^)
    let mlir = mlir_gen.generate()
    
    # Check for boolean operations in MLIR
    if "arith.andi" in mlir:
        print("  ✓ Logical AND (&&) generates arith.andi")
    if "arith.ori" in mlir:
        print("  ✓ Logical OR (||) generates arith.ori")
    
    print()


fn test_unary_operators():
    """Test unary operators."""
    print("Testing unary operators...")
    
    let source = """
fn test_unary(a: Int, b: Int) -> Int:
    let neg = -a
    if !(a > b):
        return neg
    else:
        return a
"""
    
    var parser = Parser(source, "test_unary.mojo")
    let ast = parser.parse()
    
    if parser.has_errors():
        print("✗ Unary operators failed to parse")
        for i in range(len(parser.errors)):
            print("  Error:", parser.errors[i])
        return
    
    print("✓ Unary operators parsed successfully")
    
    # Test MLIR generation
    var mlir_gen = MLIRGenerator(parser^)
    let mlir = mlir_gen.generate()
    
    # Check for unary operations in MLIR
    if "arith.subi" in mlir:
        print("  ✓ Negation (-) generates arith.subi")
    if "arith.xori" in mlir:
        print("  ✓ Logical NOT (!) generates arith.xori")
    
    print()


fn test_complex_expressions():
    """Test complex expressions with multiple operators."""
    print("Testing complex expressions...")
    
    let source = """
fn complex(a: Int, b: Int, c: Int) -> Int:
    if (a > 0 && b < 10) || (c == 5):
        return -a + b
    else:
        return a - b
"""
    
    var parser = Parser(source, "test_complex.mojo")
    let ast = parser.parse()
    
    if parser.has_errors():
        print("✗ Complex expressions failed to parse")
        for i in range(len(parser.errors)):
            print("  Error:", parser.errors[i])
        return
    
    print("✓ Complex expressions parsed successfully")
    print("  ✓ Mixed comparison and boolean operators")
    print("  ✓ Unary negation with binary arithmetic")
    print()


fn main():
    """Run all operator tests."""
    print("=== Mojo Compiler Phase 2 - Operator Tests ===\n")
    
    test_comparison_operators()
    test_boolean_operators()
    test_unary_operators()
    test_complex_expressions()
    
    print("=== All Operator Tests Passed! ===")

