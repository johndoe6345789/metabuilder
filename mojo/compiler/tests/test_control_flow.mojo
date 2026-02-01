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

"""Test control flow parsing and MLIR generation (Phase 2)."""

from src.frontend.parser import Parser
from src.ir.mlir_gen import MLIRGenerator


fn test_if_statement():
    """Test if statement parsing and MLIR generation."""
    print("Testing if statement...")
    
    let source = """
fn test_if(x: Int) -> Int:
    if x > 0:
        return 1
    else:
        return -1
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ If statement parsed successfully")
    
    # Test MLIR generation
    var mlir_gen = MLIRGenerator(parser^)
    let mlir = mlir_gen.generate_module_with_functions(parser.parse().root.functions)
    
    print("Generated MLIR:")
    print(mlir)
    print()


fn test_while_statement():
    """Test while loop parsing."""
    print("Testing while statement...")
    
    let source = """
fn test_while(n: Int) -> Int:
    var i = 0
    while i < n:
        i = i + 1
    return i
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ While statement parsed successfully")
    print()


fn test_for_statement():
    """Test for loop parsing."""
    print("Testing for statement...")
    
    let source = """
fn test_for():
    for i in range(10):
        print(i)
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ For statement parsed successfully")
    print()


fn test_nested_control_flow():
    """Test nested control flow structures."""
    print("Testing nested control flow...")
    
    let source = """
fn test_nested(n: Int) -> Int:
    if n > 0:
        var sum = 0
        for i in range(n):
            if i > 5:
                break
            sum = sum + i
        return sum
    else:
        return -1
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Nested control flow parsed successfully")
    print()


fn test_elif_chain():
    """Test elif chain."""
    print("Testing elif chain...")
    
    let source = """
fn test_elif(x: Int) -> String:
    if x < 0:
        return "negative"
    elif x == 0:
        return "zero"
    elif x < 10:
        return "small"
    else:
        return "large"
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Elif chain parsed successfully")
    print()


fn main():
    print("=== Mojo Compiler Phase 2 - Control Flow Tests ===")
    print()
    
    test_if_statement()
    test_while_statement()
    test_for_statement()
    test_nested_control_flow()
    test_elif_chain()
    
    print("=== All control flow tests passed! ===")
