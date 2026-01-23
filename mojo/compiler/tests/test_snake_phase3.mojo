# Test: Generate MLIR for snake.mojo through Phase 3 (IR)
from ..src.frontend import Lexer, Parser
from ..src.semantic import TypeChecker
from ..src.ir import MLIRGenerator

fn test_snake_phase3_mlir_generation():
    """Test MLIR code generation from snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phase 1: Frontend
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    # Phase 2: Semantic
    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    # Phase 3: IR (MLIR)
    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    # Verify MLIR generated
    var mlir_text = mlir_module.to_string()
    assert mlir_text.size() > 1000, "MLIR output should be substantial (~1500+ bytes)"

    # Verify Mojo dialect operations present
    assert mlir_text.contains("mojo.") or mlir_text.contains("llvm."), "MLIR should contain operations"

    print("Phase 3 (IR): ✅ PASS - " + str(mlir_text.size()) + " bytes of MLIR generated")


fn test_snake_phase3_function_lowering():
    """Test function lowering to MLIR"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-2
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    # Phase 3
    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    # Verify function lowering
    var functions = mlir_module.get_functions()
    assert functions.size() >= 6, "Snake game should have 6+ functions lowered to MLIR"

    print("Phase 3 (IR): ✅ PASS - " + str(functions.size()) + " functions lowered to MLIR")


fn main():
    """Run Phase 3 tests"""
    print("Running Phase 3 (IR) tests...")
    print("")

    try:
        test_snake_phase3_mlir_generation()
    except:
        print("Phase 3 (IR): ❌ FAIL - MLIR generation test failed")

    try:
        test_snake_phase3_function_lowering()
    except:
        print("Phase 3 (IR): ❌ FAIL - Function lowering test failed")

    print("")
    print("Phase 3 tests completed!")
