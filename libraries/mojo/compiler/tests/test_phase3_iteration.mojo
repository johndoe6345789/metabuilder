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

"""Test suite for Phase 3 enhanced for loops with collection iteration.

This test validates:
- Iterable trait validation in for loops
- Collection iteration type checking
- MLIR generation for iterator protocol
"""

from src.frontend.parser import Parser
from src.frontend.ast import ASTNodeKind
from src.semantic.type_checker import TypeChecker
from src.ir.mlir_gen import MLIRGenerator


fn test_builtin_iterable_trait():
    """Test that builtin Iterable trait is registered."""
    print("=== Test: Builtin Iterable Trait ===")
    
    var parser = Parser("")
    var checker = TypeChecker(parser)
    
    if checker.type_context.is_trait("Iterable"):
        print("✓ Iterable trait registered")
    else:
        print("✗ Iterable trait not found")
    
    if checker.type_context.is_trait("Iterator"):
        print("✓ Iterator trait registered")
    else:
        print("✗ Iterator trait not found")
    
    # Check Iterable trait has required methods
    let iterable = checker.type_context.lookup_trait("Iterable")
    if iterable.has_method("__iter__"):
        print("✓ Iterable trait has __iter__ method")
    else:
        print("✗ Iterable trait missing __iter__ method")
    
    print()


fn test_range_based_for_loop():
    """Test that range-based for loops work correctly."""
    print("=== Test: Range-Based For Loop ===")
    
    let source = """
fn main():
    for i in range(10):
        print(i)
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if len(checker.errors) == 0:
        print("✓ Range-based for loop passes type checking")
    else:
        print("✗ Range-based for loop has errors:")
        for i in range(len(checker.errors)):
            print("  " + checker.errors[i])
    
    print()


fn test_iterable_collection_for_loop():
    """Test for loop with collection implementing Iterable."""
    print("=== Test: Iterable Collection For Loop ===")
    
    let source = """
trait Iterable:
    fn __iter__(self) -> Iterator

trait Iterator:
    fn __next__(self) -> Optional

struct MyList(Iterable):
    var data: Int
    
    fn __iter__(self) -> Iterator:
        return self

fn main():
    var list = MyList(0)
    for item in list:
        print(item)
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    # Should pass since MyList declares Iterable conformance
    # However, it won't fully conform without __next__ implementation
    if checker.type_context.is_struct("MyList"):
        print("✓ MyList struct registered")
        
        if checker.type_context.check_trait_conformance("MyList", "Iterable"):
            print("✓ MyList conforms to Iterable")
        else:
            print("✗ MyList does not conform to Iterable (expected - missing full Iterator implementation)")
    
    print()


fn test_non_iterable_error():
    """Test that using non-iterable type in for loop produces error."""
    print("=== Test: Non-Iterable Error Detection ===")
    
    let source = """
struct Point:
    var x: Int
    var y: Int

fn main():
    var p = Point(1, 2)
    for item in p:
        print(item)
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    # Should have error about Point not being iterable
    var found_error = False
    for i in range(len(checker.errors)):
        if "Iterable" in checker.errors[i] or "iterable" in checker.errors[i]:
            found_error = True
            print("✓ Type checker detected non-iterable error:")
            print("  " + checker.errors[i])
            break
    
    if not found_error:
        print("✗ Expected error about non-iterable type")
    
    print()


fn test_for_loop_mlir_generation():
    """Test MLIR generation for for loops with iterators."""
    print("=== Test: For Loop MLIR Generation ===")
    
    let source = """
fn main():
    for i in range(5):
        print(i)
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    _ = checker.check(ast)
    
    var gen = MLIRGenerator(parser)
    let mlir = gen.generate_module(ast.root)
    
    # Check for scf.for in MLIR
    if "scf.for" in mlir:
        print("✓ MLIR contains scf.for instruction")
    else:
        print("✗ Expected scf.for in MLIR")
    
    # Check for range-based comment
    if "Range-based for loop" in mlir or "for i in" in mlir:
        print("✓ MLIR documents for loop iteration")
    else:
        print("✗ Expected for loop documentation in MLIR")
    
    print("Generated MLIR snippet:")
    let lines = mlir.split("\n")
    var in_for_loop = False
    for i in range(len(lines)):
        if "for" in lines[i].lower() or in_for_loop:
            print("  " + lines[i])
            in_for_loop = True
            if "}" in lines[i] and in_for_loop:
                break
    
    print()


fn test_collection_iterator_mlir():
    """Test MLIR generation for collection iteration."""
    print("=== Test: Collection Iterator MLIR ===")
    
    let source = """
trait Iterable:
    fn __iter__(self) -> Iterator

struct MyList(Iterable):
    var size: Int
    
    fn __iter__(self) -> Iterator:
        return self

fn process():
    var list = MyList(10)
    for x in list:
        print(x)
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var gen = MLIRGenerator(parser)
    let mlir = gen.generate_module(ast.root)
    
    # Check for iterator protocol in MLIR
    if "__iter__" in mlir:
        print("✓ MLIR mentions __iter__ protocol")
    else:
        print("✗ Expected __iter__ protocol in MLIR")
    
    if "Collection iteration" in mlir or "Iterator" in mlir:
        print("✓ MLIR documents collection iteration")
    else:
        print("✗ Expected collection iteration documentation")
    
    print()


fn main():
    """Run all Phase 3 collection iteration tests."""
    print("╔══════════════════════════════════════════╗")
    print("║   Phase 3 Collection Iteration Tests    ║")
    print("╚══════════════════════════════════════════╝")
    print()
    
    test_builtin_iterable_trait()
    test_range_based_for_loop()
    test_iterable_collection_for_loop()
    test_non_iterable_error()
    test_for_loop_mlir_generation()
    test_collection_iterator_mlir()
    
    print("╔══════════════════════════════════════════╗")
    print("║    Collection Iteration Tests Complete  ║")
    print("╚══════════════════════════════════════════╝")
