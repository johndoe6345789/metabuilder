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

"""Open source Mojo compiler.

This is the main entry point for the Mojo compiler.
It orchestrates the compilation pipeline:
1. Frontend: Lexing and parsing
2. Semantic analysis: Type checking and name resolution
3. IR generation: Lowering to MLIR
4. Optimization: MLIR optimization passes
5. Code generation: Lowering to LLVM IR and machine code
"""

from pathlib import Path
from .frontend import Lexer, Parser
from .semantic import TypeChecker
from .ir import MLIRGenerator
from .codegen import Optimizer, LLVMBackend


struct CompilerOptions:
    """Configuration options for the compiler.
    
    Attributes:
        target: Target architecture (e.g., "x86_64-linux", "aarch64-darwin").
        opt_level: Optimization level (0-3).
        stdlib_path: Path to the standard library.
        debug: Whether to include debug information.
        output_path: Path for the output executable.
    """
    
    var target: String
    var opt_level: Int
    var stdlib_path: String
    var debug: Bool
    var output_path: String
    
    fn __init__(
        inout self,
        target: String = "native",
        opt_level: Int = 2,
        stdlib_path: String = "",
        debug: Bool = False,
        output_path: String = "a.out"
    ):
        """Initialize compiler options.
        
        Args:
            target: Target architecture.
            opt_level: Optimization level (0-3).
            stdlib_path: Path to the standard library.
            debug: Whether to include debug information.
            output_path: Path for the output executable.
        """
        self.target = target
        self.opt_level = opt_level
        self.stdlib_path = stdlib_path
        self.debug = debug
        self.output_path = output_path


fn compile(source_file: String, options: CompilerOptions) raises -> Bool:
    """Compile a Mojo source file.
    
    This is the main compilation function that orchestrates the entire pipeline.
    
    Args:
        source_file: Path to the Mojo source file.
        options: Compiler configuration options.
        
    Returns:
        True if compilation succeeded, False otherwise.
        
    Raises:
        Error if compilation fails or file cannot be read.
    """
    # Read source file
    let path = Path(source_file)
    if not path.exists():
        print("Error: Source file not found:", source_file)
        return False
    
    let source = path.read_text()
    
    # Phase 1: Frontend - Parsing
    print("Parsing:", source_file)
    var parser = Parser(source, source_file)
    let ast = parser.parse()
    
    if parser.has_errors():
        print("Parse errors:")
        for error in parser.errors:
            print("  ", error)
        return False
    
    # Phase 2: Semantic Analysis - Type Checking
    print("Type checking...")
    var type_checker = TypeChecker()
    if not type_checker.check(ast):
        print("Type errors:")
        for error in type_checker.errors:
            print("  ", error)
        return False
    
    # Phase 3: IR Generation - Lower to MLIR
    print("Generating MLIR...")
    var mlir_gen = MLIRGenerator()
    let mlir_code = mlir_gen.generate(ast)
    
    # Phase 4: Optimization
    print("Optimizing...")
    var optimizer = Optimizer(options.opt_level)
    let optimized_mlir = optimizer.optimize(mlir_code)
    
    # Phase 5: Code Generation - Lower to native code
    print("Generating code...")
    var backend = LLVMBackend(options.target, options.opt_level)
    if not backend.compile(optimized_mlir, options.output_path):
        print("Code generation failed")
        return False
    
    print("Compilation successful:", options.output_path)
    return True


fn main() raises:
    """Main entry point for the compiler CLI."""
    # TODO: Parse command line arguments
    # For now, use default options
    var options = CompilerOptions()
    
    # Example usage:
    # compile("example.mojo", options)
    
    print("Mojo Open Source Compiler")
    print("Usage: mojo-compiler <source_file>")
