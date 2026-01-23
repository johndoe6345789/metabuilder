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

"""Node store for tracking AST node types and providing retrieval helpers.

This module provides functionality to track the kind of each AST node
and retrieve node data by reference.
"""

from collections import List
from .ast import (
    ASTNodeRef,
    ASTNodeKind,
    FunctionNode,
    ReturnStmtNode,
    VarDeclNode,
    BinaryExprNode,
    CallExprNode,
    IdentifierExprNode,
    IntegerLiteralNode,
    FloatLiteralNode,
    StringLiteralNode,
)


struct NodeStore:
    """Stores AST nodes and tracks their kinds.
    
    The NodeStore works alongside the parser to:
    1. Track what kind each node reference corresponds to
    2. Provide retrieval methods for specific node types
    """
    
    var node_kinds: List[Int]  # Maps node ref -> node kind
    
    fn __init__(inout self):
        """Initialize an empty node store."""
        self.node_kinds = List[Int]()
    
    fn register_node(inout self, node_ref: ASTNodeRef, kind: Int) -> ASTNodeRef:
        """Register a node and its kind.
        
        Args:
            node_ref: The node reference (index).
            kind: The ASTNodeKind value.
            
        Returns:
            The node reference (for convenience).
        """
        # Ensure the list is big enough
        while len(self.node_kinds) <= node_ref:
            self.node_kinds.append(0)
        
        self.node_kinds[node_ref] = kind
        return node_ref
    
    fn get_node_kind(self, node_ref: ASTNodeRef) -> Int:
        """Get the kind of a node.
        
        Args:
            node_ref: The node reference.
            
        Returns:
            The ASTNodeKind value, or -1 if invalid reference.
        """
        if node_ref < 0 or node_ref >= len(self.node_kinds):
            return -1
        return self.node_kinds[node_ref]
    
    fn is_expression(self, node_ref: ASTNodeRef) -> Bool:
        """Check if a node is an expression.
        
        Args:
            node_ref: The node reference.
            
        Returns:
            True if the node is an expression type.
        """
        let kind = self.get_node_kind(node_ref)
        return (kind >= ASTNodeKind.BINARY_EXPR and kind <= ASTNodeKind.BOOL_LITERAL)
    
    fn is_statement(self, node_ref: ASTNodeRef) -> Bool:
        """Check if a node is a statement.
        
        Args:
            node_ref: The node reference.
            
        Returns:
            True if the node is a statement type.
        """
        let kind = self.get_node_kind(node_ref)
        return (kind >= ASTNodeKind.VAR_DECL and kind <= ASTNodeKind.CONTINUE_STMT)
