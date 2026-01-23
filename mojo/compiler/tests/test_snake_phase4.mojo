# Test: Compile snake.mojo to LLVM IR through Phase 4 (Codegen)
from ..src.frontend import Lexer, Parser
from ..src.semantic import TypeChecker
from ..src.ir import MLIRGenerator
from ..src.codegen import LLVMBackend, Optimizer

fn test_snake_phase4_llvm_lowering():
    """Test LLVM IR generation from snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-3
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    # Phase 4: Codegen (LLVM)
    var llvm_backend = LLVMBackend()
    var llvm_module = llvm_backend.lower(mlir_module)

    # Verify LLVM IR generated
    var llvm_text = llvm_module.to_string()
    assert llvm_text.size() > 2000, "LLVM IR should be generated (2000+ bytes)"
    assert llvm_text.contains("define") or llvm_text.contains("@"), "LLVM IR should contain function definitions"

    print("Phase 4 (Codegen): ✅ PASS - " + str(llvm_text.size()) + " bytes of LLVM IR generated")


fn test_snake_phase4_optimization():
    """Test code optimization"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-3
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    # Phase 4 with optimization
    var llvm_backend = LLVMBackend(optimization_level=2)  # O2
    var llvm_module = llvm_backend.lower(mlir_module)
    var optimized = llvm_backend.optimize(llvm_module)

    # Verify optimization applied
    var original_size = llvm_module.to_string().size()
    var optimized_size = optimized.to_string().size()

    # O2 optimization should reduce or maintain code size
    assert optimized_size <= original_size, "Optimization should maintain or reduce code size"

    if optimized_size < original_size:
        var reduction_pct = 100 * (original_size - optimized_size) / original_size
        print("Phase 4 (Codegen): ✅ PASS - Optimization reduced size by " + str(reduction_pct) + "%")
    else:
        print("Phase 4 (Codegen): ✅ PASS - Optimization completed")


fn test_snake_phase4_machine_code():
    """Test machine code generation"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-4
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    var llvm_backend = LLVMBackend()
    var llvm_module = llvm_backend.lower(mlir_module)

    # Generate machine code for x86_64
    var machine_code = llvm_backend.codegen(llvm_module, target="x86_64-unknown-linux-gnu")

    # Verify machine code generated
    assert machine_code.size() > 0, "Machine code should be generated"

    print("Phase 4 (Codegen): ✅ PASS - Machine code generated (" + str(machine_code.size()) + " bytes)")


fn main():
    """Run Phase 4 tests"""
    print("Running Phase 4 (Codegen) tests...")
    print("")

    try:
        test_snake_phase4_llvm_lowering()
    except:
        print("Phase 4 (Codegen): ❌ FAIL - LLVM lowering test failed")

    try:
        test_snake_phase4_optimization()
    except:
        print("Phase 4 (Codegen): ❌ FAIL - Optimization test failed")

    try:
        test_snake_phase4_machine_code()
    except:
        print("Phase 4 (Codegen): ❌ FAIL - Machine code test failed")

    print("")
    print("Phase 4 tests completed!")
