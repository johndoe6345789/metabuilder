# Test: Parse snake.mojo through Phase 1 (Frontend)
from ..src.frontend import Lexer, Parser

fn test_snake_phase1_lexing():
    """Test lexical analysis of snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Tokenize the snake game
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()

    # Verify token count (388 lines → ~2500 tokens expected)
    assert tokens.size() > 2000, "Expected ~2500 tokens from 388-line snake.mojo"
    assert tokens.size() < 3000, "Token count seems too high"

    # Verify first tokens are valid
    if tokens.size() > 0:
        let first_token_type = tokens[0].token_type
        assert first_token_type == "STRUCT" or first_token_type == "FN" or first_token_type == "VAR", "First token should be a keyword"

    print("Phase 1 (Frontend): ✅ PASS - " + str(tokens.size()) + " tokens generated")


fn test_snake_phase1_parsing():
    """Test syntax analysis of snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Lex and parse
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    # Verify AST structure
    assert ast is not None, "AST should be generated"

    print("Phase 1 (Frontend): ✅ PASS - Complete AST generated from snake.mojo")


fn main():
    """Run Phase 1 tests"""
    print("Running Phase 1 (Frontend) tests...")
    print("")

    try:
        test_snake_phase1_lexing()
    except:
        print("Phase 1 (Frontend): ❌ FAIL - Lexing test failed")

    try:
        test_snake_phase1_parsing()
    except:
        print("Phase 1 (Frontend): ❌ FAIL - Parsing test failed")

    print("")
    print("Phase 1 tests completed!")
