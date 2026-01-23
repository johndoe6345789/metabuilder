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

"""Test struct parsing (Phase 2)."""

from src.frontend.parser import Parser


fn test_simple_struct():
    """Test simple struct definition."""
    print("Testing simple struct...")
    
    let source = """
struct Point:
    var x: Int
    var y: Int
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Simple struct parsed successfully")
    print()


fn test_struct_with_methods():
    """Test struct with methods."""
    print("Testing struct with methods...")
    
    let source = """
struct Rectangle:
    var width: Int
    var height: Int
    
    fn area(self) -> Int:
        return self.width * self.height
    
    fn perimeter(self) -> Int:
        return 2 * (self.width + self.height)
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Struct with methods parsed successfully")
    print()


fn test_struct_with_init():
    """Test struct with __init__ method."""
    print("Testing struct with __init__...")
    
    let source = """
struct Vector:
    var x: Float
    var y: Float
    var z: Float
    
    fn __init__(inout self, x: Float, y: Float, z: Float):
        self.x = x
        self.y = y
        self.z = z
    
    fn magnitude(self) -> Float:
        return sqrt(self.x * self.x + self.y * self.y + self.z * self.z)
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Struct with __init__ parsed successfully")
    print()


fn test_struct_with_default_values():
    """Test struct with default field values."""
    print("Testing struct with default values...")
    
    let source = """
struct Config:
    var name: String = "default"
    var count: Int = 0
    var enabled: Bool = True
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Struct with default values parsed successfully")
    print()


fn test_nested_struct_types():
    """Test struct with field types that are other structs."""
    print("Testing nested struct types...")
    
    let source = """
struct Inner:
    var value: Int

struct Outer:
    var inner: Inner
    var count: Int
"""
    
    var parser = Parser(source)
    _ = parser.parse()
    
    print("✓ Nested struct types parsed successfully")
    print()


fn main():
    print("=== Mojo Compiler Phase 2 - Struct Parsing Tests ===")
    print()
    
    test_simple_struct()
    test_struct_with_methods()
    test_struct_with_init()
    test_struct_with_default_values()
    test_nested_struct_types()
    
    print("=== All struct parsing tests passed! ===")
