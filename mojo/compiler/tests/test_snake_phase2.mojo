# Test: Type-check snake.mojo through Phase 2 (Semantic)
from collections import List
from ..src.frontend import Lexer, Parser
from ..src.semantic import TypeChecker

fn test_snake_phase2_type_checking():
    """Test semantic analysis and type checking of snake.mojo."""
    var snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        var source = f.read()

    # Phase 1: Frontend
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    # Phase 2: Semantic analysis
    var type_checker = TypeChecker(parser)
    var check_result = type_checker.check(ast)

    # Verify type checking succeeded
    if len(type_checker.errors) == 0:
        print("Phase 2 (Semantic): ✅ PASS - Type checking succeeded with 0 errors")
    else:
        print("Phase 2 (Semantic): ❌ FAIL - Type checking found " + str(len(type_checker.errors)) + " errors")


fn test_snake_phase2_symbol_resolution():
    """Test symbol table population during semantic analysis."""
    var snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        var source = f.read()

    # Phase 1 + Phase 2
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker(parser)
    var check_result = type_checker.check(ast)

    # Verify symbol table populated
    var symbol_count = type_checker.symbol_table.size()
    if symbol_count > 30:
        print("Phase 2 (Semantic): ✅ PASS - " + str(symbol_count) + " symbols resolved")
    else:
        print("Phase 2 (Semantic): ⚠️  WARNING - Only " + str(symbol_count) + " symbols resolved (expected 30+)")


fn main():
    """Run Phase 2 tests."""
    print("Running Phase 2 (Semantic) tests...")
    print("")

    try:
        test_snake_phase2_type_checking()
    except e:
        print("Phase 2 (Semantic): ❌ FAIL - Type checking test failed: " + str(e))

    try:
        test_snake_phase2_symbol_resolution()
    except e:
        print("Phase 2 (Semantic): ❌ FAIL - Symbol resolution test failed: " + str(e))

    print("")
    print("Phase 2 tests completed!")
