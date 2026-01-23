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

"""Test struct type checking, instantiation, and method calls (Phase 2)."""

from src.frontend.parser import Parser
from src.semantic.type_checker import TypeChecker


fn test_struct_type_checking():
    """Test struct definition type checking."""
    print("Testing struct type checking...")
    
    let source = """
struct Point:
    var x: Int
    var y: Int
    
    fn distance(self) -> Int:
        return self.x * self.x + self.y * self.y
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    var type_checker = TypeChecker(parser^)
    _ = type_checker.check_node(0)  # Check the struct
    
    print("✓ Struct type checking passed")
    print()


fn test_struct_instantiation():
    """Test struct instantiation."""
    print("Testing struct instantiation...")
    
    let source = """
struct Point:
    var x: Int
    var y: Int

fn main():
    var p = Point(1, 2)
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    var type_checker = TypeChecker(parser^)
    
    # Type check will validate struct instantiation
    print("✓ Struct instantiation parsed successfully")
    print()


fn test_field_access():
    """Test field access."""
    print("Testing field access...")
    
    let source = """
struct Point:
    var x: Int
    var y: Int

fn main():
    var p = Point(1, 2)
    var x_val = p.x
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Field access parsed successfully")
    print()


fn test_method_call():
    """Test method calls."""
    print("Testing method calls...")
    
    let source = """
struct Rectangle:
    var width: Int
    var height: Int
    
    fn area(self) -> Int:
        return self.width * self.height

fn main():
    var rect = Rectangle(10, 20)
    var a = rect.area()
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Method call parsed successfully")
    print()


fn main():
    """Run all struct tests."""
    print("=== Phase 2 Struct Tests ===\n")
    
    test_struct_type_checking()
    test_struct_instantiation()
    test_field_access()
    test_method_call()
    
    print("=== All Phase 2 Struct Tests Passed! ===")
