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

"""Test suite for Phase 3 trait implementation.

This test validates:
- Trait parsing
- Trait type checking
- Trait conformance validation
- MLIR struct codegen improvements
"""

from src.frontend.parser import Parser
from src.frontend.ast import ASTNodeKind
from src.semantic.type_checker import TypeChecker
from src.ir.mlir_gen import MLIRGenerator


fn test_trait_parsing():
    """Test that trait definitions are parsed correctly."""
    print("=== Test: Trait Parsing ===")
    
    let source = """
trait Hashable:
    fn hash(self) -> Int
    fn equals(self, other: Self) -> Bool

trait Printable:
    fn to_string(self) -> String
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    
    # Check that traits were parsed
    if len(parser.trait_nodes) == 2:
        print("✓ Parsed 2 trait definitions")
    else:
        print("✗ Expected 2 traits, got " + str(len(parser.trait_nodes)))
    
    # Check first trait
    if len(parser.trait_nodes) > 0:
        let hashable = parser.trait_nodes[0]
        if hashable.name == "Hashable":
            print("✓ First trait name is 'Hashable'")
        else:
            print("✗ Expected 'Hashable', got '" + hashable.name + "'")
        
        if len(hashable.methods) == 2:
            print("✓ Hashable has 2 required methods")
        else:
            print("✗ Expected 2 methods, got " + str(len(hashable.methods)))
    
    # Check second trait
    if len(parser.trait_nodes) > 1:
        let printable = parser.trait_nodes[1]
        if printable.name == "Printable":
            print("✓ Second trait name is 'Printable'")
        else:
            print("✗ Expected 'Printable', got '" + printable.name + "'")
        
        if len(printable.methods) == 1:
            print("✓ Printable has 1 required method")
        else:
            print("✗ Expected 1 method, got " + str(len(printable.methods)))
    
    print()


fn test_trait_type_checking():
    """Test that trait type checking works correctly."""
    print("=== Test: Trait Type Checking ===")
    
    let source = """
trait Hashable:
    fn hash(self) -> Int

trait BadTrait:
    fn bad_method(self) -> UnknownType
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    # Should have errors due to UnknownType
    if len(checker.errors) > 0:
        print("✓ Type checker detected errors in BadTrait")
        print("  Error: " + checker.errors[0])
    else:
        print("✗ Expected type checking errors")
    
    print()


fn test_trait_conformance_valid():
    """Test that valid trait conformance is accepted."""
    print("=== Test: Valid Trait Conformance ===")
    
    let source = """
trait Hashable:
    fn hash(self) -> Int

struct Point:
    var x: Int
    var y: Int
    
    fn hash(self) -> Int:
        return self.x + self.y
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    # Validate conformance manually
    if checker.type_context.is_trait("Hashable") and checker.type_context.is_struct("Point"):
        print("✓ Both Hashable trait and Point struct registered")
        
        if checker.type_context.check_trait_conformance("Point", "Hashable"):
            print("✓ Point conforms to Hashable trait")
        else:
            print("✗ Point should conform to Hashable")
    else:
        print("✗ Failed to register trait or struct")
    
    print()


fn test_trait_conformance_invalid():
    """Test that invalid trait conformance is rejected."""
    print("=== Test: Invalid Trait Conformance ===")
    
    let source = """
trait Hashable:
    fn hash(self) -> Int
    fn equals(self, other: Self) -> Bool

struct Point:
    var x: Int
    var y: Int
    
    fn hash(self) -> Int:
        return self.x + self.y
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    # Point is missing the equals method
    if not checker.type_context.check_trait_conformance("Point", "Hashable"):
        print("✓ Point correctly does not conform to Hashable (missing equals)")
    else:
        print("✗ Point should not conform - missing equals method")
    
    # Test the detailed validation
    let conforms = checker.validate_trait_conformance("Point", "Hashable", parser.struct_nodes[0].location)
    if not conforms and len(checker.errors) > 0:
        print("✓ Validation generated error message")
        print("  Error: " + checker.errors[len(checker.errors) - 1])
    
    print()


fn test_mlir_struct_codegen():
    """Test improved MLIR struct codegen."""
    print("=== Test: MLIR Struct Codegen ===")
    
    let source = """
struct Point:
    var x: Int
    var y: Int
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    _ = checker.check(ast)
    
    var gen = MLIRGenerator(parser)
    let mlir = gen.generate_module(ast.root)
    
    # Check that MLIR contains struct type information
    if "!llvm.struct" in mlir:
        print("✓ MLIR contains LLVM struct type definition")
    else:
        print("✗ Expected LLVM struct type in MLIR")
    
    if "i64" in mlir:
        print("✓ MLIR contains Int->i64 type mapping")
    else:
        print("✗ Expected i64 type in MLIR")
    
    print("Generated MLIR snippet:")
    # Print first few lines
    let lines = mlir.split("\n")
    for i in range(min(10, len(lines))):
        print("  " + lines[i])
    
    print()


fn test_mlir_trait_codegen():
    """Test MLIR trait code generation."""
    print("=== Test: MLIR Trait Codegen ===")
    
    let source = """
trait Hashable:
    fn hash(self) -> Int
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var gen = MLIRGenerator(parser)
    let mlir = gen.generate_module(ast.root)
    
    # Check that MLIR contains trait documentation
    if "Trait definition: Hashable" in mlir:
        print("✓ MLIR contains trait definition comment")
    else:
        print("✗ Expected trait definition in MLIR")
    
    if "Required methods:" in mlir:
        print("✓ MLIR documents required methods")
    else:
        print("✗ Expected required methods documentation")
    
    print()


fn main():
    """Run all Phase 3 trait tests."""
    print("╔══════════════════════════════════════════╗")
    print("║   Phase 3 Trait Implementation Tests    ║")
    print("╚══════════════════════════════════════════╝")
    print()
    
    test_trait_parsing()
    test_trait_type_checking()
    test_trait_conformance_valid()
    test_trait_conformance_invalid()
    test_mlir_struct_codegen()
    test_mlir_trait_codegen()
    
    print("╔══════════════════════════════════════════╗")
    print("║         Phase 3 Tests Complete          ║")
    print("╚══════════════════════════════════════════╝")
