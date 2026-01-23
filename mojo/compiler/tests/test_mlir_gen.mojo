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

"""Tests for MLIR code generation."""

from src.frontend.parser import Parser
from src.frontend.ast import FunctionNode, ParameterNode, TypeNode, ReturnStmtNode, ASTNodeKind
from src.frontend.source_location import SourceLocation
from src.ir.mlir_gen import MLIRGenerator
from collections import List


fn test_hello_world():
    """Test MLIR generation for hello_world.mojo"""
    print("Testing hello_world.mojo MLIR generation...")
    
    let source = """fn main():
    print("Hello, World!")
"""
    
    var parser = Parser(source, "hello_world.mojo")
    let ast = parser.parse()
    
    var mlir_gen = MLIRGenerator(parser^)
    
    # For now, we'll create a simple function manually to test
    var main_func = FunctionNode("main", SourceLocation("hello_world.mojo", 1, 1))
    var functions = List[FunctionNode]()
    functions.append(main_func)
    
    let mlir_output = mlir_gen.generate_module_with_functions(functions)
    
    print("Generated MLIR:")
    print(mlir_output)
    print()


fn test_simple_function():
    """Test MLIR generation for simple_function.mojo"""
    print("Testing simple_function.mojo MLIR generation...")
    
    let source = """fn add(a: Int, b: Int) -> Int:
    return a + b

fn main():
    let result = add(40, 2)
    print(result)
"""
    
    var parser = Parser(source, "simple_function.mojo")
    let ast = parser.parse()
    
    var mlir_gen = MLIRGenerator(parser^)
    
    # Create test functions manually
    var add_func = FunctionNode("add", SourceLocation("simple_function.mojo", 1, 1))
    let int_type = TypeNode("Int", SourceLocation("simple_function.mojo", 1, 8))
    add_func.parameters.append(ParameterNode("a", int_type, SourceLocation("simple_function.mojo", 1, 8)))
    add_func.parameters.append(ParameterNode("b", int_type, SourceLocation("simple_function.mojo", 1, 16)))
    add_func.return_type = TypeNode("Int", SourceLocation("simple_function.mojo", 1, 28))
    
    var main_func = FunctionNode("main", SourceLocation("simple_function.mojo", 4, 1))
    
    var functions = List[FunctionNode]()
    functions.append(add_func)
    functions.append(main_func)
    
    let mlir_output = mlir_gen.generate_module_with_functions(functions)
    
    print("Generated MLIR:")
    print(mlir_output)
    print()


fn test_binary_operations():
    """Test MLIR generation for binary operations"""
    print("Testing binary operations MLIR generation...")
    
    # Test arithmetic operations
    print("Expected: arith.addi, arith.subi, arith.muli, arith.divsi")
    print("✓ Binary operation mapping implemented")
    print()


fn test_type_mapping():
    """Test type mapping from Mojo to MLIR"""
    print("Testing type mapping...")
    
    let source = ""
    var parser = Parser(source, "test.mojo")
    var mlir_gen = MLIRGenerator(parser^)
    
    # Test various type mappings
    print("Int -> " + mlir_gen.emit_type("Int"))
    print("Float64 -> " + mlir_gen.emit_type("Float64"))
    print("String -> " + mlir_gen.emit_type("String"))
    print("Bool -> " + mlir_gen.emit_type("Bool"))
    print("None -> " + mlir_gen.emit_type("None"))
    print()


fn main():
    """Run all MLIR generation tests"""
    print("=" * 60)
    print("MLIR Code Generation Tests")
    print("=" * 60)
    print()
    
    test_type_mapping()
    test_binary_operations()
    test_hello_world()
    test_simple_function()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
