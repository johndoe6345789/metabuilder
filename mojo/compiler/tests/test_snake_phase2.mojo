# Test: Type-check snake.mojo through Phase 2 (Semantic)
from ..src.frontend import Lexer, Parser
from ..src.semantic import TypeChecker

fn test_snake_phase2_type_checking():
    """Test semantic analysis and type checking of snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phase 1: Frontend
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    # Phase 2: Semantic analysis
    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    # Verify type checking succeeded
    assert type_checker.errors.size() == 0, "Type checking should have 0 errors for valid snake.mojo"

    print("Phase 2 (Semantic): ✅ PASS - Type checking succeeded with 0 errors")


fn test_snake_phase2_symbol_resolution():
    """Test symbol table population during semantic analysis"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phase 1 + Phase 2
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    # Verify symbol table populated
    var symbols = type_checker.symbol_table.get_all_symbols()
    assert symbols.size() > 30, "Symbol table should have 30+ symbols for snake game"

    print("Phase 2 (Semantic): ✅ PASS - " + str(symbols.size()) + " symbols resolved")


fn main():
    """Run Phase 2 tests"""
    print("Running Phase 2 (Semantic) tests...")
    print("")

    try:
        test_snake_phase2_type_checking()
    except:
        print("Phase 2 (Semantic): ❌ FAIL - Type checking test failed")

    try:
        test_snake_phase2_symbol_resolution()
    except:
        print("Phase 2 (Semantic): ❌ FAIL - Symbol resolution test failed")

    print("")
    print("Phase 2 tests completed!")
