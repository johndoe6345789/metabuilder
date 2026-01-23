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

"""Test suite for the type checker implementation.

This tests the type checker's ability to:
- Check variable declarations
- Type check expressions
- Validate function calls
- Report type errors
"""

from src.frontend.parser import Parser
from src.semantic.type_checker import TypeChecker


fn test_hello_world():
    """Test type checking a simple hello world program."""
    print("\n=== Test: Hello World ===")
    
    let source = """fn main():
    print("Hello, World!")
"""
    
    var parser = Parser(source, "hello_world.mojo")
    let ast = parser.parse()
    
    if len(parser.errors) > 0:
        print("Parse errors:")
        for i in range(len(parser.errors)):
            print("  " + parser.errors[i])
        return
    
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if success:
        print("✓ Type checking passed")
    else:
        print("✗ Type checking failed:")
        checker.print_errors()


fn test_simple_function():
    """Test type checking a function with parameters and return."""
    print("\n=== Test: Simple Function ===")
    
    let source = """fn add(a: Int, b: Int) -> Int:
    return a + b

fn main():
    let result = add(40, 2)
    print(result)
"""
    
    var parser = Parser(source, "simple_function.mojo")
    let ast = parser.parse()
    
    if len(parser.errors) > 0:
        print("Parse errors:")
        for i in range(len(parser.errors)):
            print("  " + parser.errors[i])
        return
    
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if success:
        print("✓ Type checking passed")
    else:
        print("✗ Type checking failed:")
        checker.print_errors()


fn test_type_error():
    """Test that type errors are caught."""
    print("\n=== Test: Type Error Detection ===")
    
    let source = """fn main():
    let x: Int = 42
    let y: String = "hello"
    let z = x + y
"""
    
    var parser = Parser(source, "type_error.mojo")
    let ast = parser.parse()
    
    if len(parser.errors) > 0:
        print("Parse errors:")
        for i in range(len(parser.errors)):
            print("  " + parser.errors[i])
        return
    
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if not success:
        print("✓ Type error correctly detected:")
        checker.print_errors()
    else:
        print("✗ Type error not detected (should have failed)")


fn test_variable_inference():
    """Test type inference for variable declarations."""
    print("\n=== Test: Type Inference ===")
    
    let source = """fn main():
    let x = 42
    let y = 3.14
    let z = "hello"
    let sum = x + x
"""
    
    var parser = Parser(source, "inference.mojo")
    let ast = parser.parse()
    
    if len(parser.errors) > 0:
        print("Parse errors:")
        for i in range(len(parser.errors)):
            print("  " + parser.errors[i])
        return
    
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if success:
        print("✓ Type inference successful")
    else:
        print("✗ Type inference failed:")
        checker.print_errors()


fn main():
    """Run all type checker tests."""
    print("=" * 60)
    print("Type Checker Test Suite")
    print("=" * 60)
    
    test_hello_world()
    test_simple_function()
    test_type_error()
    test_variable_inference()
    
    print("\n" + "=" * 60)
    print("Tests complete")
    print("=" * 60)
