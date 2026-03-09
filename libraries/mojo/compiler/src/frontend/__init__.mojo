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

"""Frontend module for the Mojo compiler.

This module contains the lexer and parser for Mojo source code.
It is responsible for converting source text into an Abstract Syntax Tree (AST).
"""

from .lexer import Lexer, Token, TokenKind
from .parser import Parser, AST
from .source_location import SourceLocation
from .ast import (
    ModuleNode,
    FunctionNode,
    ParameterNode,
    TypeNode,
    VarDeclNode,
    ReturnStmtNode,
    BinaryExprNode,
    CallExprNode,
    IdentifierExprNode,
    IntegerLiteralNode,
    FloatLiteralNode,
    StringLiteralNode,
)

__all__ = [
    "Lexer",
    "Token",
    "TokenKind",
    "Parser",
    "AST",
    "SourceLocation",
    "ModuleNode",
    "FunctionNode",
    "ParameterNode",
    "TypeNode",
    "VarDeclNode",
    "ReturnStmtNode",
    "BinaryExprNode",
    "CallExprNode",
    "IdentifierExprNode",
    "IntegerLiteralNode",
    "FloatLiteralNode",
    "StringLiteralNode",
]
