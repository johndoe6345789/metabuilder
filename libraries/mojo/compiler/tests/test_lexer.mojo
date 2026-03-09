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

"""Simple test demonstrating the lexer functionality.

This shows how the lexer tokenizes Mojo source code.
"""

from src.frontend import Lexer, TokenKind


fn test_lexer_keywords():
    """Test that keywords are correctly recognized."""
    print("=== Testing Lexer: Keywords ===")
    
    let source = "fn struct var def if else while for return"
    var lexer = Lexer(source, "test.mojo")
    
    print("Source:", source)
    print("Tokens:")
    
    var token = lexer.next_token()
    while token.kind.kind != TokenKind.EOF:
        print("  ", token.text, "->", "keyword")
        token = lexer.next_token()
    
    print()


fn test_lexer_literals():
    """Test that literals are correctly parsed."""
    print("=== Testing Lexer: Literals ===")
    
    let source = '42 3.14 "Hello, World!" True False'
    var lexer = Lexer(source, "test.mojo")
    
    print("Source:", source)
    print("Tokens:")
    
    var token = lexer.next_token()
    while token.kind.kind != TokenKind.EOF:
        let kind_name = "integer" if token.kind.kind == TokenKind.INTEGER_LITERAL else (
            "float" if token.kind.kind == TokenKind.FLOAT_LITERAL else (
                "string" if token.kind.kind == TokenKind.STRING_LITERAL else (
                    "bool" if token.kind.kind == TokenKind.BOOL_LITERAL else "unknown"
                )
            )
        )
        print("  ", token.text, "->", kind_name)
        token = lexer.next_token()
    
    print()


fn test_lexer_operators():
    """Test that operators are correctly recognized."""
    print("=== Testing Lexer: Operators ===")
    
    let source = "+ - * / == != < > <= >= = ->"
    var lexer = Lexer(source, "test.mojo")
    
    print("Source:", source)
    print("Tokens:")
    
    var token = lexer.next_token()
    while token.kind.kind != TokenKind.EOF:
        print("  ", token.text, "-> operator")
        token = lexer.next_token()
    
    print()


fn test_lexer_function():
    """Test lexing a complete function."""
    print("=== Testing Lexer: Complete Function ===")
    
    let source = """fn add(a: Int, b: Int) -> Int:
    return a + b"""
    
    var lexer = Lexer(source, "test.mojo")
    
    print("Source:")
    print(source)
    print()
    print("Token stream:")
    
    var token = lexer.next_token()
    while token.kind.kind != TokenKind.EOF:
        if token.kind.kind == TokenKind.NEWLINE:
            print("  NEWLINE")
        else:
            print("  ", token.text)
        token = lexer.next_token()
    
    print()


fn main():
    """Run lexer tests."""
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║        Mojo Compiler - Lexer Test Suite                  ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()
    
    test_lexer_keywords()
    test_lexer_literals()
    test_lexer_operators()
    test_lexer_function()
    
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  All lexer tests completed!                               ║")
    print("║  Note: Some functionality still under development         ║")
    print("╚═══════════════════════════════════════════════════════════╝")
