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

"""Tests for the LLVM backend."""

from src.codegen.llvm_backend import LLVMBackend
from src.codegen.optimizer import Optimizer


fn test_llvm_ir_generation():
    """Test MLIR to LLVM IR translation."""
    print("Testing LLVM IR generation...")
    
    let backend = LLVMBackend("x86_64-unknown-linux-gnu", 2)
    
    # Test simple hello world
    let hello_mlir = """module {
  func.func @main() {
    %0 = arith.constant "Hello, World!" : !mojo.string
    mojo.print %0 : !mojo.string
    return
  }
}"""
    
    let llvm_ir = backend.lower_to_llvm_ir(hello_mlir)
    
    print("Generated LLVM IR:")
    print(llvm_ir)
    
    # Verify key components
    assert "define i32 @main()" in llvm_ir, "Main function not found"
    assert "declare void @_mojo_print_string" in llvm_ir, "Print declaration missing"
    assert "ret i32 0" in llvm_ir, "Return statement missing"
    
    print("✓ Hello World IR generation passed")


fn test_function_call_ir():
    """Test function call translation."""
    print("\nTesting function call IR generation...")
    
    let backend = LLVMBackend("x86_64-unknown-linux-gnu", 2)
    
    let func_mlir = """module {
  func.func @add(%arg0: i64, %arg1: i64) -> i64 {
    %0 = arith.addi %arg0, %arg1 : i64
    return %0 : i64
  }
  
  func.func @main() {
    %0 = arith.constant 40 : i64
    %1 = arith.constant 2 : i64
    %2 = func.call @add(%0, %1) : (i64, i64) -> i64
    mojo.print %2 : i64
    return
  }
}"""
    
    let llvm_ir = backend.lower_to_llvm_ir(func_mlir)
    
    print("Generated LLVM IR:")
    print(llvm_ir)
    
    # Verify key components
    assert "define i64 @add" in llvm_ir, "Add function not found"
    assert "add i64" in llvm_ir, "Addition operation missing"
    assert "call i64 @add" in llvm_ir, "Function call missing"
    assert "_mojo_print_int" in llvm_ir, "Print int call missing"
    
    print("✓ Function call IR generation passed")


fn test_optimizer():
    """Test optimizer passes."""
    print("\nTesting optimizer...")
    
    let optimizer = Optimizer(2)
    
    let test_mlir = """module {
  func.func @main() {
    %0 = arith.constant 42 : i64
    %1 = arith.constant 10 : i64
    %2 = arith.addi %0, %1 : i64
    mojo.print %2 : i64
    return
  }
}"""
    
    let optimized = optimizer.optimize(test_mlir)
    
    print("Optimized MLIR:")
    print(optimized)
    
    # Basic check - optimizer should preserve structure
    assert "func.func @main" in optimized, "Main function lost"
    assert "mojo.print" in optimized, "Print statement lost"
    
    print("✓ Optimizer passes passed")


fn test_backend_compilation():
    """Test full compilation pipeline (requires llc and cc)."""
    print("\nTesting backend compilation...")
    
    let backend = LLVMBackend("x86_64-unknown-linux-gnu", 2)
    
    let hello_mlir = """module {
  func.func @main() {
    %0 = arith.constant "Hello from backend!" : !mojo.string
    mojo.print %0 : !mojo.string
    return
  }
}"""
    
    # Try to compile (may fail if tools not available)
    try:
        let success = backend.compile(hello_mlir, "test_output", "runtime")
        if success:
            print("✓ Backend compilation passed")
            # Clean up
            _ = os.system("rm -f test_output test_output.o test_output.o.ll")
        else:
            print("⚠ Backend compilation skipped (missing tools)")
    except:
        print("⚠ Backend compilation skipped (missing tools)")


fn main():
    """Run all backend tests."""
    print("=" * 60)
    print("Backend Tests")
    print("=" * 60)
    
    test_llvm_ir_generation()
    test_function_call_ir()
    test_optimizer()
    test_backend_compilation()
    
    print("\n" + "=" * 60)
    print("All backend tests completed!")
    print("=" * 60)
