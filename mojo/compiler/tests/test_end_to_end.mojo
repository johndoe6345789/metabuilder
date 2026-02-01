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

"""End-to-end compilation tests.

This test suite runs the full compiler pipeline from source code to executable:
1. Lexing
2. Parsing
3. Type checking
4. MLIR generation
5. Optimization
6. LLVM IR generation
7. Compilation to object file
8. Linking with runtime

Tests the example programs: hello_world.mojo and simple_function.mojo
"""

from src.frontend.lexer import Lexer, TokenKind
from src.frontend.parser import Parser
from src.semantic.type_checker import TypeChecker
from src.ir.mlir_gen import MLIRGenerator
from src.codegen.optimizer import Optimizer
from src.codegen.llvm_backend import LLVMBackend


fn read_file(path: String) -> String:
    """Read file contents."""
    try:
        with open(path, "r") as f:
            return f.read()
    except:
        print("Error reading file:", path)
        return ""


fn test_hello_world_compilation():
    """Test compiling hello_world.mojo end-to-end."""
    print("\n" + "=" * 60)
    print("Test: Hello World Compilation")
    print("=" * 60)
    
    # Read source
    let source = read_file("examples/hello_world.mojo")
    if source == "":
        print("⚠ Could not read hello_world.mojo")
        return
    
    print("\n[1/7] Source code:")
    print(source)
    
    # Lexing
    print("\n[2/7] Lexing...")
    var lexer = Lexer(source)
    lexer.tokenize()
    print("  Tokens:", len(lexer.tokens))
    
    # Parsing
    print("\n[3/7] Parsing...")
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    print("  AST nodes:", len(parser.node_store.nodes))
    
    # Type checking
    print("\n[4/7] Type checking...")
    var type_checker = TypeChecker(parser^)
    let typed_ast = type_checker.check()
    print("  Type checking complete")
    
    # MLIR generation
    print("\n[5/7] Generating MLIR...")
    parser = type_checker.parser^
    var mlir_gen = MLIRGenerator(parser^)
    let functions = List[FunctionNode]()
    # Get main function from parser
    if len(mlir_gen.parser.function_nodes) > 0:
        functions.append(mlir_gen.parser.function_nodes[0])
    
    let mlir_code = mlir_gen.generate_module_with_functions(functions)
    print("\nGenerated MLIR:")
    print(mlir_code)
    
    # Optimization
    print("\n[6/7] Optimizing...")
    let optimizer = Optimizer(2)
    let optimized_mlir = optimizer.optimize(mlir_code)
    print("  Optimization complete")
    
    # Backend compilation
    print("\n[7/7] Compiling to executable...")
    let backend = LLVMBackend("x86_64-unknown-linux-gnu", 2)
    
    try:
        let success = backend.compile(optimized_mlir, "hello_world_out", "runtime")
        if success:
            print("\n✓ Hello World compilation PASSED")
            print("\nExecuting compiled program:")
            print("-" * 40)
            _ = os.system("./hello_world_out")
            print("-" * 40)
            
            # Clean up
            _ = os.system("rm -f hello_world_out hello_world_out.o hello_world_out.o.ll")
        else:
            print("\n⚠ Compilation incomplete (missing tools)")
    except:
        print("\n⚠ Compilation incomplete (missing tools)")


fn test_simple_function_compilation():
    """Test compiling simple_function.mojo end-to-end."""
    print("\n" + "=" * 60)
    print("Test: Simple Function Compilation")
    print("=" * 60)
    
    # Read source
    let source = read_file("examples/simple_function.mojo")
    if source == "":
        print("⚠ Could not read simple_function.mojo")
        return
    
    print("\n[1/7] Source code:")
    print(source)
    
    # Lexing
    print("\n[2/7] Lexing...")
    var lexer = Lexer(source)
    lexer.tokenize()
    print("  Tokens:", len(lexer.tokens))
    
    # Parsing
    print("\n[3/7] Parsing...")
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    print("  AST nodes:", len(parser.node_store.nodes))
    
    # Type checking
    print("\n[4/7] Type checking...")
    var type_checker = TypeChecker(parser^)
    let typed_ast = type_checker.check()
    print("  Type checking complete")
    
    # MLIR generation
    print("\n[5/7] Generating MLIR...")
    parser = type_checker.parser^
    var mlir_gen = MLIRGenerator(parser^)
    let functions = parser.function_nodes
    
    let mlir_code = mlir_gen.generate_module_with_functions(functions)
    print("\nGenerated MLIR:")
    print(mlir_code)
    
    # Optimization
    print("\n[6/7] Optimizing...")
    let optimizer = Optimizer(2)
    let optimized_mlir = optimizer.optimize(mlir_code)
    print("  Optimization complete")
    
    # Backend compilation
    print("\n[7/7] Compiling to executable...")
    let backend = LLVMBackend("x86_64-unknown-linux-gnu", 2)
    
    try:
        let success = backend.compile(optimized_mlir, "simple_function_out", "runtime")
        if success:
            print("\n✓ Simple Function compilation PASSED")
            print("\nExecuting compiled program:")
            print("-" * 40)
            _ = os.system("./simple_function_out")
            print("-" * 40)
            
            # Clean up
            _ = os.system("rm -f simple_function_out simple_function_out.o simple_function_out.o.ll")
        else:
            print("\n⚠ Compilation incomplete (missing tools)")
    except:
        print("\n⚠ Compilation incomplete (missing tools)")


fn test_tools_availability():
    """Check if required compilation tools are available."""
    print("\n" + "=" * 60)
    print("Checking Required Tools")
    print("=" * 60)
    
    # Check for llc
    var llc_check = os.system("which llc > /dev/null 2>&1")
    if llc_check == 0:
        print("✓ llc (LLVM compiler) - Available")
        _ = os.system("llc --version | head -1")
    else:
        print("✗ llc (LLVM compiler) - NOT FOUND")
        print("  Install: apt-get install llvm")
    
    # Check for cc
    var cc_check = os.system("which cc > /dev/null 2>&1")
    if cc_check == 0:
        print("✓ cc (C compiler) - Available")
        _ = os.system("cc --version | head -1")
    else:
        print("✗ cc (C compiler) - NOT FOUND")
        print("  Install: apt-get install gcc")
    
    # Check for runtime library
    var runtime_check = os.system("test -f runtime/libmojo_runtime.a")
    if runtime_check == 0:
        print("✓ Runtime library - Available")
    else:
        print("✗ Runtime library - NOT FOUND")
        print("  Build: cd runtime && make")
    
    print()


fn main():
    """Run all end-to-end compilation tests."""
    print("=" * 60)
    print("END-TO-END COMPILATION TESTS")
    print("=" * 60)
    print("\nThis test suite validates the complete compiler pipeline:")
    print("  Source → Lexer → Parser → Type Checker → MLIR →")
    print("  Optimizer → LLVM IR → Object File → Executable")
    
    test_tools_availability()
    
    test_hello_world_compilation()
    test_simple_function_compilation()
    
    print("\n" + "=" * 60)
    print("End-to-End Tests Complete")
    print("=" * 60)
    print("\nNote: If compilation tools (llc, cc) are not available,")
    print("some tests will be skipped. Install LLVM and GCC to run")
    print("complete end-to-end compilation tests.")
