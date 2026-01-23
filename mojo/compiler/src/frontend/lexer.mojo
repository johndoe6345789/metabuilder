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

"""Lexer for Mojo source code.

The lexer is responsible for tokenizing Mojo source code into a stream of tokens.
It handles:
- Keywords (fn, struct, var, def, etc.)
- Identifiers
- Literals (integers, floats, strings)
- Operators and punctuation
- Comments
- Whitespace (for indentation-based syntax)
"""

from .source_location import SourceLocation


@value
struct TokenKind:
    """Represents the kind of a token."""
    
    # Keywords
    alias FN = 0
    alias STRUCT = 1
    alias TRAIT = 2
    alias VAR = 3
    alias DEF = 4
    alias IF = 5
    alias ELSE = 6
    alias ELIF = 7
    alias WHILE = 8
    alias FOR = 9
    alias IN = 10
    alias RETURN = 11
    alias BREAK = 12
    alias CONTINUE = 13
    alias PASS = 14
    alias IMPORT = 15
    alias FROM = 16
    alias AS = 17
    alias ALIAS = 18
    alias LET = 19
    alias MUT = 20
    alias INOUT = 21
    alias OWNED = 22
    alias BORROWED = 23
    
    # Literals
    alias IDENTIFIER = 100
    alias INTEGER_LITERAL = 101
    alias FLOAT_LITERAL = 102
    alias STRING_LITERAL = 103
    alias BOOL_LITERAL = 104
    
    # Operators
    alias PLUS = 200
    alias MINUS = 201
    alias STAR = 202
    alias SLASH = 203
    alias PERCENT = 204
    alias DOUBLE_STAR = 205
    alias EQUAL = 206
    alias DOUBLE_EQUAL = 207
    alias NOT_EQUAL = 208
    alias LESS = 209
    alias GREATER = 210
    alias LESS_EQUAL = 211
    alias GREATER_EQUAL = 212
    alias AMPERSAND = 213
    alias PIPE = 214
    alias CARET = 215
    alias TILDE = 216
    alias DOUBLE_AMPERSAND = 217
    alias DOUBLE_PIPE = 218
    alias EXCLAMATION = 219
    alias ARROW = 220
    
    # Punctuation
    alias LEFT_PAREN = 300
    alias RIGHT_PAREN = 301
    alias LEFT_BRACKET = 302
    alias RIGHT_BRACKET = 303
    alias LEFT_BRACE = 304
    alias RIGHT_BRACE = 305
    alias COMMA = 306
    alias COLON = 307
    alias SEMICOLON = 308
    alias DOT = 309
    alias AT = 310
    alias QUESTION = 311
    
    # Special
    alias NEWLINE = 400
    alias INDENT = 401
    alias DEDENT = 402
    alias EOF = 403
    alias ERROR = 404
    
    var kind: Int
    
    fn __init__(inout self, kind: Int):
        self.kind = kind


struct Token:
    """Represents a lexical token."""
    
    var kind: TokenKind
    var text: String
    var location: SourceLocation
    
    fn __init__(inout self, kind: TokenKind, text: String, location: SourceLocation):
        self.kind = kind
        self.text = text
        self.location = location


struct Lexer:
    """Tokenizes Mojo source code.
    
    The lexer processes source text character by character and produces tokens.
    It handles indentation-based syntax similar to Python.
    """
    
    var source: String
    var position: Int
    var line: Int
    var column: Int
    var filename: String
    
    fn __init__(inout self, source: String, filename: String = "<input>"):
        """Initialize the lexer with source code.
        
        Args:
            source: The Mojo source code to tokenize.
            filename: The name of the source file (for error reporting).
        """
        self.source = source
        self.position = 0
        self.line = 1
        self.column = 1
        self.filename = filename
    
    fn next_token(inout self) -> Token:
        """Get the next token from the source.
        
        Returns:
            The next token in the source stream.
        """
        self.skip_whitespace()
        
        # Check for EOF
        if self.position >= len(self.source):
            return Token(
                TokenKind(TokenKind.EOF),
                "",
                SourceLocation(self.filename, self.line, self.column)
            )
        
        let start_line = self.line
        let start_column = self.column
        let ch = self.peek_char()
        
        # Handle comments
        if ch == "#":
            self.skip_comment()
            return self.next_token()
        
        # Handle newlines
        if ch == "\n":
            self.advance()
            return Token(
                TokenKind(TokenKind.NEWLINE),
                "\n",
                SourceLocation(self.filename, start_line, start_column)
            )
        
        # Handle string literals
        if ch == "\"" or ch == "'":
            let string_val = self.read_string()
            return Token(
                TokenKind(TokenKind.STRING_LITERAL),
                string_val,
                SourceLocation(self.filename, start_line, start_column)
            )
        
        # Handle numbers
        if self.is_digit(ch):
            return self.read_number()
        
        # Handle identifiers and keywords
        if self.is_alpha(ch) or ch == "_":
            let text = self.read_identifier()
            if self.is_keyword(text):
                return Token(
                    self.keyword_kind(text),
                    text,
                    SourceLocation(self.filename, start_line, start_column)
                )
            return Token(
                TokenKind(TokenKind.IDENTIFIER),
                text,
                SourceLocation(self.filename, start_line, start_column)
            )
        
        # Handle operators and punctuation
        if ch == "+":
            self.advance()
            return Token(TokenKind(TokenKind.PLUS), "+", SourceLocation(self.filename, start_line, start_column))
        if ch == "-":
            self.advance()
            if self.peek_char() == ">":
                self.advance()
                return Token(TokenKind(TokenKind.ARROW), "->", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.MINUS), "-", SourceLocation(self.filename, start_line, start_column))
        if ch == "*":
            self.advance()
            if self.peek_char() == "*":
                self.advance()
                return Token(TokenKind(TokenKind.DOUBLE_STAR), "**", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.STAR), "*", SourceLocation(self.filename, start_line, start_column))
        if ch == "/":
            self.advance()
            return Token(TokenKind(TokenKind.SLASH), "/", SourceLocation(self.filename, start_line, start_column))
        if ch == "%":
            self.advance()
            return Token(TokenKind(TokenKind.PERCENT), "%", SourceLocation(self.filename, start_line, start_column))
        if ch == "=":
            self.advance()
            if self.peek_char() == "=":
                self.advance()
                return Token(TokenKind(TokenKind.DOUBLE_EQUAL), "==", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.EQUAL), "=", SourceLocation(self.filename, start_line, start_column))
        if ch == "!":
            self.advance()
            if self.peek_char() == "=":
                self.advance()
                return Token(TokenKind(TokenKind.NOT_EQUAL), "!=", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.EXCLAMATION), "!", SourceLocation(self.filename, start_line, start_column))
        if ch == "<":
            self.advance()
            if self.peek_char() == "=":
                self.advance()
                return Token(TokenKind(TokenKind.LESS_EQUAL), "<=", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.LESS), "<", SourceLocation(self.filename, start_line, start_column))
        if ch == ">":
            self.advance()
            if self.peek_char() == "=":
                self.advance()
                return Token(TokenKind(TokenKind.GREATER_EQUAL), ">=", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.GREATER), ">", SourceLocation(self.filename, start_line, start_column))
        if ch == "&":
            self.advance()
            if self.peek_char() == "&":
                self.advance()
                return Token(TokenKind(TokenKind.DOUBLE_AMPERSAND), "&&", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.AMPERSAND), "&", SourceLocation(self.filename, start_line, start_column))
        if ch == "|":
            self.advance()
            if self.peek_char() == "|":
                self.advance()
                return Token(TokenKind(TokenKind.DOUBLE_PIPE), "||", SourceLocation(self.filename, start_line, start_column))
            return Token(TokenKind(TokenKind.PIPE), "|", SourceLocation(self.filename, start_line, start_column))
        if ch == "~":
            self.advance()
            return Token(TokenKind(TokenKind.TILDE), "~", SourceLocation(self.filename, start_line, start_column))
        if ch == "(":
            self.advance()
            return Token(TokenKind(TokenKind.LEFT_PAREN), "(", SourceLocation(self.filename, start_line, start_column))
        if ch == ")":
            self.advance()
            return Token(TokenKind(TokenKind.RIGHT_PAREN), ")", SourceLocation(self.filename, start_line, start_column))
        if ch == "[":
            self.advance()
            return Token(TokenKind(TokenKind.LEFT_BRACKET), "[", SourceLocation(self.filename, start_line, start_column))
        if ch == "]":
            self.advance()
            return Token(TokenKind(TokenKind.RIGHT_BRACKET), "]", SourceLocation(self.filename, start_line, start_column))
        if ch == "{":
            self.advance()
            return Token(TokenKind(TokenKind.LEFT_BRACE), "{", SourceLocation(self.filename, start_line, start_column))
        if ch == "}":
            self.advance()
            return Token(TokenKind(TokenKind.RIGHT_BRACE), "}", SourceLocation(self.filename, start_line, start_column))
        if ch == ",":
            self.advance()
            return Token(TokenKind(TokenKind.COMMA), ",", SourceLocation(self.filename, start_line, start_column))
        if ch == ":":
            self.advance()
            return Token(TokenKind(TokenKind.COLON), ":", SourceLocation(self.filename, start_line, start_column))
        if ch == "@":
            self.advance()
            return Token(TokenKind(TokenKind.AT), "@", SourceLocation(self.filename, start_line, start_column))
        if ch == ".":
            self.advance()
            return Token(TokenKind(TokenKind.DOT), ".", SourceLocation(self.filename, start_line, start_column))
        
        # Unknown character - return error token
        self.advance()
        return Token(
            TokenKind(TokenKind.ERROR),
            ch,
            SourceLocation(self.filename, start_line, start_column)
        )
    
    fn peek_char(self) -> String:
        """Peek at the current character without consuming it.
        
        Returns:
            The current character, or empty string if at EOF.
        """
        if self.position >= len(self.source):
            return ""
        return self.source[self.position]
    
    fn advance(inout self):
        """Advance to the next character in the source."""
        if self.position < len(self.source):
            if self.source[self.position] == "\n":
                self.line += 1
                self.column = 1
            else:
                self.column += 1
            self.position += 1
    
    fn skip_whitespace(inout self):
        """Skip whitespace characters (except newlines for indentation tracking)."""
        while self.position < len(self.source):
            let ch = self.peek_char()
            if ch == " " or ch == "\t" or ch == "\r":
                self.advance()
            else:
                break
    
    fn skip_comment(inout self):
        """Skip a comment (# to end of line)."""
        while self.position < len(self.source) and self.peek_char() != "\n":
            self.advance()
    
    fn read_identifier(inout self) -> String:
        """Read an identifier or keyword.
        
        Returns:
            The identifier text.
        """
        var result = String("")
        while self.position < len(self.source):
            let ch = self.peek_char()
            if self.is_alpha(ch) or self.is_digit(ch) or ch == "_":
                result += ch
                self.advance()
            else:
                break
        return result
    
    fn read_number(inout self) -> Token:
        """Read a numeric literal (integer or float).
        
        Returns:
            A token representing the number.
        """
        let start_line = self.line
        let start_column = self.column
        var result = String("")
        var is_float = False
        
        while self.position < len(self.source):
            let ch = self.peek_char()
            if self.is_digit(ch):
                result += ch
                self.advance()
            elif ch == "." and not is_float:
                is_float = True
                result += ch
                self.advance()
            else:
                break
        
        if is_float:
            return Token(
                TokenKind(TokenKind.FLOAT_LITERAL),
                result,
                SourceLocation(self.filename, start_line, start_column)
            )
        else:
            return Token(
                TokenKind(TokenKind.INTEGER_LITERAL),
                result,
                SourceLocation(self.filename, start_line, start_column)
            )
    
    fn read_string(inout self) -> String:
        """Read a string literal.
        
        Returns:
            The string content (without quotes).
        """
        let quote = self.peek_char()
        self.advance()  # Skip opening quote
        
        var result = String("")
        while self.position < len(self.source):
            let ch = self.peek_char()
            if ch == quote:
                self.advance()  # Skip closing quote
                break
            elif ch == "\\":
                self.advance()
                # Handle escape sequences
                if self.position < len(self.source):
                    let escaped = self.peek_char()
                    if escaped == "n":
                        result += "\n"
                    elif escaped == "t":
                        result += "\t"
                    elif escaped == "r":
                        result += "\r"
                    elif escaped == "\\":
                        result += "\\"
                    elif escaped == quote:
                        result += quote
                    else:
                        result += escaped
                    self.advance()
            else:
                result += ch
                self.advance()
        
        return result
    
    fn is_keyword(self, text: String) -> Bool:
        """Check if a string is a keyword.
        
        Args:
            text: The text to check.
            
        Returns:
            True if the text is a keyword, False otherwise.
        """
        if text == "fn" or text == "struct" or text == "trait":
            return True
        if text == "var" or text == "def" or text == "alias" or text == "let":
            return True
        if text == "if" or text == "else" or text == "elif":
            return True
        if text == "while" or text == "for" or text == "in":
            return True
        if text == "return" or text == "break" or text == "continue" or text == "pass":
            return True
        if text == "import" or text == "from" or text == "as":
            return True
        if text == "mut" or text == "inout" or text == "owned" or text == "borrowed":
            return True
        if text == "True" or text == "False":
            return True
        return False
    
    fn keyword_kind(self, text: String) -> TokenKind:
        """Get the token kind for a keyword.
        
        Args:
            text: The keyword text.
            
        Returns:
            The corresponding TokenKind.
        """
        if text == "fn":
            return TokenKind(TokenKind.FN)
        if text == "struct":
            return TokenKind(TokenKind.STRUCT)
        if text == "trait":
            return TokenKind(TokenKind.TRAIT)
        if text == "var":
            return TokenKind(TokenKind.VAR)
        if text == "def":
            return TokenKind(TokenKind.DEF)
        if text == "alias":
            return TokenKind(TokenKind.ALIAS)
        if text == "let":
            return TokenKind(TokenKind.LET)
        if text == "if":
            return TokenKind(TokenKind.IF)
        if text == "else":
            return TokenKind(TokenKind.ELSE)
        if text == "elif":
            return TokenKind(TokenKind.ELIF)
        if text == "while":
            return TokenKind(TokenKind.WHILE)
        if text == "for":
            return TokenKind(TokenKind.FOR)
        if text == "in":
            return TokenKind(TokenKind.IN)
        if text == "return":
            return TokenKind(TokenKind.RETURN)
        if text == "break":
            return TokenKind(TokenKind.BREAK)
        if text == "continue":
            return TokenKind(TokenKind.CONTINUE)
        if text == "pass":
            return TokenKind(TokenKind.PASS)
        if text == "import":
            return TokenKind(TokenKind.IMPORT)
        if text == "from":
            return TokenKind(TokenKind.FROM)
        if text == "as":
            return TokenKind(TokenKind.AS)
        if text == "mut":
            return TokenKind(TokenKind.MUT)
        if text == "inout":
            return TokenKind(TokenKind.INOUT)
        if text == "owned":
            return TokenKind(TokenKind.OWNED)
        if text == "borrowed":
            return TokenKind(TokenKind.BORROWED)
        if text == "True" or text == "False":
            return TokenKind(TokenKind.BOOL_LITERAL)
        return TokenKind(TokenKind.IDENTIFIER)
    
    fn is_alpha(self, ch: String) -> Bool:
        """Check if a character is alphabetic.
        
        Args:
            ch: The character to check.
            
        Returns:
            True if alphabetic, False otherwise.
        """
        if len(ch) != 1:
            return False
        let code = ord(ch)
        return (code >= ord("a") and code <= ord("z")) or (code >= ord("A") and code <= ord("Z"))
    
    fn is_digit(self, ch: String) -> Bool:
        """Check if a character is a digit.
        
        Args:
            ch: The character to check.
            
        Returns:
            True if digit, False otherwise.
        """
        if len(ch) != 1:
            return False
        let code = ord(ch)
        return code >= ord("0") and code <= ord("9")
