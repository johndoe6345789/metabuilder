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

"""Symbol table for name resolution and scoping.

The symbol table tracks:
- Variable declarations and their types
- Function definitions
- Struct definitions
- Scoping information
"""

from collections import Dict, List
from .type_system import Type


struct Symbol:
    """Represents a symbol in the symbol table.
    
    A symbol can be:
    - A variable
    - A function
    - A struct
    - A parameter
    """
    
    var name: String
    var type: Type
    var is_mutable: Bool
    
    fn __init__(inout self, name: String, type: Type, is_mutable: Bool = False):
        """Initialize a symbol.
        
        Args:
            name: The name of the symbol.
            type: The type of the symbol.
            is_mutable: Whether the symbol is mutable.
        """
        self.name = name
        self.type = type
        self.is_mutable = is_mutable


struct Scope:
    """Represents a single scope level."""
    
    var symbols: Dict[String, Symbol]
    
    fn __init__(inout self):
        """Initialize an empty scope."""
        self.symbols = Dict[String, Symbol]()


struct SymbolTable:
    """Symbol table for name resolution.
    
    Maintains a hierarchy of scopes for resolving names.
    Uses a stack-based approach for scope management.
    """
    
    var scopes: List[Scope]  # Stack of scopes
    
    fn __init__(inout self):
        """Initialize symbol table with global scope."""
        self.scopes = List[Scope]()
        # Push global scope
        self.scopes.append(Scope())
    
    fn insert(inout self, name: String, symbol_type: Type, is_mutable: Bool = False) -> Bool:
        """Insert a symbol into the current scope.
        
        Args:
            name: The name of the symbol.
            symbol_type: The type of the symbol.
            is_mutable: Whether the symbol is mutable (var vs let).
            
        Returns:
            True if successfully inserted, False if already exists in current scope.
        """
        if len(self.scopes) == 0:
            return False
        
        # Check if already declared in current scope
        let current_scope_idx = len(self.scopes) - 1
        if name in self.scopes[current_scope_idx].symbols:
            return False
        
        # Add to current scope
        let symbol = Symbol(name, symbol_type, is_mutable)
        self.scopes[current_scope_idx].symbols[name] = symbol
        return True
    
    fn lookup(self, name: String) -> Type:
        """Look up a symbol by name, searching from innermost to outermost scope.
        
        Args:
            name: The name of the symbol.
            
        Returns:
            The symbol type if found, Unknown type otherwise.
        """
        # Search from innermost scope outward
        var i = len(self.scopes) - 1
        while i >= 0:
            if name in self.scopes[i].symbols:
                return self.scopes[i].symbols[name].type
            i -= 1
        
        # Not found - return Unknown type
        return Type("Unknown")
    
    fn is_declared(self, name: String) -> Bool:
        """Check if a symbol is declared in any scope.
        
        Args:
            name: The name of the symbol.
            
        Returns:
            True if the symbol exists.
        """
        var i = len(self.scopes) - 1
        while i >= 0:
            if name in self.scopes[i].symbols:
                return True
            i -= 1
        return False
    
    fn is_declared_in_current_scope(self, name: String) -> Bool:
        """Check if a symbol is declared in the current scope only.
        
        Args:
            name: The name of the symbol.
            
        Returns:
            True if declared in current scope (not parent scopes).
        """
        if len(self.scopes) == 0:
            return False
        let current_scope_idx = len(self.scopes) - 1
        return name in self.scopes[current_scope_idx].symbols
    
    fn push_scope(inout self):
        """Enter a new scope (e.g., function body, block)."""
        self.scopes.append(Scope())
    
    fn pop_scope(inout self):
        """Exit the current scope."""
        if len(self.scopes) > 1:  # Keep at least global scope
            _ = self.scopes.pop()

    fn size(self) -> Int:
        """Count total symbols across all scopes.

        Returns:
            The total number of symbols in the symbol table.
        """
        var total = 0
        var i = 0
        while i < len(self.scopes):
            total += len(self.scopes[i].symbols)
            i += 1
        return total
