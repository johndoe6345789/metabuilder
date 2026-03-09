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

"""Semantic analysis module for the Mojo compiler.

This module performs type checking, name resolution, and semantic validation
on the AST produced by the parser.
"""

from .type_checker import TypeChecker
from .symbol_table import SymbolTable, Symbol
from .type_system import Type, TypeContext

__all__ = ["TypeChecker", "SymbolTable", "Symbol", "Type", "TypeContext"]
