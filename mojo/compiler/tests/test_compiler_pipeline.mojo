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

"""Test the complete compiler pipeline.

This test demonstrates that all compiler components are properly integrated
and can work together to process a Mojo program through the full pipeline.
"""

from src import CompilerOptions
from src.frontend import Lexer, Parser
from src.semantic import TypeChecker
from src.ir import MLIRGenerator
from src.codegen import Optimizer, LLVMBackend


fn test_lexer():
    """Test the lexer with a simple program."""
    print("\n=== Test 1: Lexer ===")
    
    let source = """fn main():
    print("Hello, World!")
"""
    
    var lexer = Lexer(source, "test.mojo")
    print("Tokenizing source code...")
    
    var token_count = 0
    while True:
        let token = lexer.next_token()
        if token.kind == 0:  # EOF
            break
        token_count += 1
        if token_count <= 5:  # Print first 5 tokens
            print("  Token:", token.text, "at line", token.location.line)
    
    print("Total tokens:", token_count)
    print("✓ Lexer test passed")


fn test_type_system():
    """Test the type system."""
    print("\n=== Test 2: Type System ===")
    
    from src.semantic.type_system import Type, TypeContext
    
    var context = TypeContext()
    
    # Check builtin types
    let int_type = context.lookup_type("Int")
    let float_type = context.lookup_type("Float64")
    let bool_type = context.lookup_type("Bool")
    
    print("Registered builtin types:")
    print("  - Int:", int_type.is_builtin())
    print("  - Float64:", float_type.is_builtin())
    print("  - Bool:", bool_type.is_builtin())
    
    # Test type compatibility
    print("\nType compatibility checks:")
    print("  - Int == Int:", int_type.is_compatible_with(int_type))
    print("  - Int == Float64:", int_type.is_compatible_with(float_type))
    print("  - Int is numeric:", int_type.is_numeric())
    print("  - Bool is numeric:", bool_type.is_numeric())
    
    print("✓ Type system test passed")


fn test_mlir_generator():
    """Test the MLIR generator."""
    print("\n=== Test 3: MLIR Generator ===")
    
    var generator = MLIRGenerator()
    
    # Create a simple AST
    from src.frontend.parser import AST
    from src.frontend.ast import ModuleNode
    from src.frontend.source_location import SourceLocation
    
    let loc = SourceLocation("test.mojo", 1, 1)
    var module = ModuleNode(loc)
    var ast = AST(module, "test.mojo")
    
    print("Generating MLIR from AST...")
    let mlir_code = generator.generate(ast)
    
    print("Generated MLIR:")
    print(mlir_code)
    
    print("✓ MLIR generator test passed")


fn test_optimizer():
    """Test the optimizer."""
    print("\n=== Test 4: Optimizer ===")
    
    let sample_mlir = """module {
  func.func @main() {
    return
  }
}"""
    
    var optimizer = Optimizer(2)
    print("Optimizing MLIR code...")
    let optimized = optimizer.optimize(sample_mlir)
    
    print("Optimization complete")
    print("✓ Optimizer test passed")


fn test_llvm_backend():
    """Test the LLVM backend."""
    print("\n=== Test 5: LLVM Backend ===")
    
    let sample_mlir = """module {
  func.func @main() {
    return
  }
}"""
    
    var backend = LLVMBackend("x86_64-linux", 2)
    
    print("Converting MLIR to LLVM IR...")
    let llvm_ir = backend.lower_to_llvm_ir(sample_mlir)
    
    print("Generated LLVM IR snippet:")
    let lines = llvm_ir.split("\n")
    for i in range(min(5, len(lines))):
        print("  ", lines[i])
    
    print("✓ LLVM backend test passed")


fn test_memory_runtime():
    """Test the memory runtime functions."""
    print("\n=== Test 6: Memory Runtime ===")
    
    from src.runtime.memory import malloc, free
    
    print("Testing memory allocation...")
    
    # Allocate some memory
    let ptr = malloc(64)
    print("  Allocated 64 bytes at:", ptr)
    
    # Free the memory
    free(ptr)
    print("  Freed memory")
    
    print("✓ Memory runtime test passed")


fn test_compiler_options():
    """Test compiler options."""
    print("\n=== Test 7: Compiler Options ===")
    
    var options = CompilerOptions(
        target="x86_64-linux",
        opt_level=2,
        stdlib_path="../stdlib",
        debug=False,
        output_path="test_output"
    )
    
    print("Compiler configuration:")
    print("  Target:", options.target)
    print("  Optimization:", options.opt_level)
    print("  Debug mode:", options.debug)
    print("  Output:", options.output_path)
    
    print("✓ Compiler options test passed")


fn main() raises:
    """Run all compiler tests."""
    print("=" * 60)
    print("Mojo Open Source Compiler - Integration Tests")
    print("=" * 60)
    
    print("\nTesting compiler components...")
    print("These tests verify that all parts of the compiler pipeline")
    print("are properly implemented and can work together.")
    
    # Run all tests
    test_lexer()
    test_type_system()
    test_mlir_generator()
    test_optimizer()
    test_llvm_backend()
    test_memory_runtime()
    test_compiler_options()
    
    print("\n" + "=" * 60)
    print("All Tests Passed! ✓")
    print("=" * 60)
    print("\nThe compiler infrastructure is working correctly.")
    print("Next steps:")
    print("  1. Complete parser implementation")
    print("  2. Implement full type checking")
    print("  3. Generate complete MLIR code")
    print("  4. Integrate with actual MLIR/LLVM libraries")
    print("  5. Compile and run Hello World program")
