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

"""Parser for Mojo source code.

The parser builds an Abstract Syntax Tree (AST) from a stream of tokens.
It handles:
- Module structure
- Function and struct definitions
- Expressions and statements
- Type annotations
- Parameter blocks
- Decorators
"""

from collections import List
from .lexer import Lexer, Token, TokenKind
from .source_location import SourceLocation
from .node_store import NodeStore
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
    BoolLiteralNode,
    IfStmtNode,
    WhileStmtNode,
    ForStmtNode,
    BreakStmtNode,
    ContinueStmtNode,
    PassStmtNode,
    StructNode,
    FieldNode,
    TraitNode,
    UnaryExprNode,
    MemberAccessNode,
    ASTNodeRef,
    ASTNodeKind,
)


struct AST:
    """Represents the Abstract Syntax Tree for a Mojo module.
    
    The AST is the intermediate representation between parsing and
    semantic analysis. It preserves the structure of the source code.
    """
    
    var root: ModuleNode
    var filename: String
    
    fn __init__(inout self, root: ModuleNode, filename: String):
        """Initialize an AST.
        
        Args:
            root: The root node of the tree (a Module node).
            filename: The source filename.
        """
        self.root = root
        self.filename = filename


struct Parser:
    """Parses Mojo source code into an AST.
    
    The parser uses recursive descent parsing to build the AST from tokens.
    It reports syntax errors with helpful diagnostics.
    """
    
    var lexer: Lexer
    var current_token: Token
    var errors: List[String]
    var node_store: NodeStore  # Tracks node kinds
    
    # Node storage for Phase 1 & 2 - parser owns all nodes
    var return_nodes: List[ReturnStmtNode]
    var var_decl_nodes: List[VarDeclNode]
    var int_literal_nodes: List[IntegerLiteralNode]
    var float_literal_nodes: List[FloatLiteralNode]
    var string_literal_nodes: List[StringLiteralNode]
    var bool_literal_nodes: List[BoolLiteralNode]
    var identifier_nodes: List[IdentifierExprNode]
    var call_expr_nodes: List[CallExprNode]
    var binary_expr_nodes: List[BinaryExprNode]
    var unary_expr_nodes: List[UnaryExprNode]
    var member_access_nodes: List[MemberAccessNode]  # Phase 2: Member access
    
    # Phase 2: Control flow nodes
    var if_stmt_nodes: List[IfStmtNode]
    var while_stmt_nodes: List[WhileStmtNode]
    var for_stmt_nodes: List[ForStmtNode]
    var break_stmt_nodes: List[BreakStmtNode]
    var continue_stmt_nodes: List[ContinueStmtNode]
    var pass_stmt_nodes: List[PassStmtNode]
    
    # Phase 2: Struct and trait nodes
    var struct_nodes: List[StructNode]
    var field_nodes: List[FieldNode]
    var trait_nodes: List[TraitNode]
    
    fn __init__(inout self, source: String, filename: String = "<input>"):
        """Initialize the parser with source code.
        
        Args:
            source: The Mojo source code to parse.
            filename: The name of the source file (for error reporting).
        """
        self.lexer = Lexer(source, filename)
        # Get the first token
        self.current_token = self.lexer.next_token()
        self.errors = List[String]()
        self.node_store = NodeStore()
        
        # Initialize node storage
        self.return_nodes = List[ReturnStmtNode]()
        self.var_decl_nodes = List[VarDeclNode]()
        self.int_literal_nodes = List[IntegerLiteralNode]()
        self.float_literal_nodes = List[FloatLiteralNode]()
        self.string_literal_nodes = List[StringLiteralNode]()
        self.bool_literal_nodes = List[BoolLiteralNode]()
        self.identifier_nodes = List[IdentifierExprNode]()
        self.call_expr_nodes = List[CallExprNode]()
        self.binary_expr_nodes = List[BinaryExprNode]()
        self.unary_expr_nodes = List[UnaryExprNode]()
        self.member_access_nodes = List[MemberAccessNode]()
        
        # Initialize Phase 2 node storage
        self.if_stmt_nodes = List[IfStmtNode]()
        self.while_stmt_nodes = List[WhileStmtNode]()
        self.for_stmt_nodes = List[ForStmtNode]()
        self.break_stmt_nodes = List[BreakStmtNode]()
        self.continue_stmt_nodes = List[ContinueStmtNode]()
        self.pass_stmt_nodes = List[PassStmtNode]()
        self.struct_nodes = List[StructNode]()
        self.field_nodes = List[FieldNode]()
        self.trait_nodes = List[TraitNode]()
    
    fn parse(inout self) -> AST:
        """Parse the source code into an AST.
        
        Returns:
            The parsed AST.
        """
        let module = self.parse_module()
        return AST(module, self.lexer.filename)
    
    fn parse_module(inout self) -> ModuleNode:
        """Parse a module (top-level).
        
        Returns:
            The module AST node.
        """
        var module = ModuleNode(SourceLocation(self.lexer.filename, 1, 1))
        
        # Parse top-level declarations
        while self.current_token.kind.kind != TokenKind.EOF:
            # Skip newlines at module level
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
                continue
            
            # Parse function definitions
            if self.current_token.kind.kind == TokenKind.FN:
                let func = self.parse_function()
                # In a real implementation, we would add the function to the module
                # module.add_declaration(func)
            # Parse struct definitions
            elif self.current_token.kind.kind == TokenKind.STRUCT:
                let struct_def = self.parse_struct()
                # Store struct for later processing
            # Parse trait definitions
            elif self.current_token.kind.kind == TokenKind.TRAIT:
                let trait_def = self.parse_trait()
                # Store trait for later processing
            else:
                self.error("Expected function, struct, or trait definition")
                self.advance()  # Skip the problematic token
        
        return module
    
    fn parse_function(inout self) -> FunctionNode:
        """Parse a function definition.
        
        Returns:
            The function AST node.
        """
        let start_location = self.current_token.location
        
        # Expect 'fn' keyword
        if not self.expect(TokenKind(TokenKind.FN)):
            self.error("Expected 'fn'")
            return FunctionNode("error", start_location)
        
        # Parse function name
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected function name")
            return FunctionNode("error", start_location)
        
        let name = self.current_token.text
        self.advance()
        
        var func = FunctionNode(name, start_location)
        
        # Parse parameter list
        if not self.expect(TokenKind(TokenKind.LEFT_PAREN)):
            self.error("Expected '('")
            return func
        
        # Parse parameters
        self.parse_parameters(func)
        
        if not self.expect(TokenKind(TokenKind.RIGHT_PAREN)):
            self.error("Expected ')'")
            return func
        
        # Parse optional return type
        if self.current_token.kind.kind == TokenKind.ARROW:
            self.advance()
            func.return_type = self.parse_type()
        
        # Expect colon
        if not self.expect(TokenKind(TokenKind.COLON)):
            self.error("Expected ':'")
            return func
        
        # Parse function body
        self.parse_function_body(func)
        
        return func
    
    fn parse_struct(inout self) -> StructNode:
        """Parse a struct definition.
        
        Returns:
            The struct AST node.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'struct'
        
        # Parse struct name
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected struct name")
            return StructNode("Error", location)
        
        let name = self.current_token.text
        self.advance()
        
        # TODO: Handle parametric structs [T: Type] in future phase
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after struct name")
        else:
            self.advance()
        
        # Create struct node
        var struct_node = StructNode(name, location)
        
        # Expect newline
        if self.current_token.kind.kind == TokenKind.NEWLINE:
            self.advance()
        
        # Parse struct body (fields and methods)
        while (self.current_token.kind.kind != TokenKind.EOF and
               self.current_token.kind.kind != TokenKind.DEDENT):
            
            # Skip extra newlines
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
                continue
            
            # Check if it's a method (fn keyword)
            if self.current_token.kind.kind == TokenKind.FN:
                let method = self.parse_function()
                struct_node.methods.append(method)
            # Otherwise it's a field (var keyword)
            elif self.current_token.kind.kind == TokenKind.VAR:
                let field = self.parse_struct_field()
                struct_node.fields.append(field)
            else:
                self.error("Expected 'var' for field or 'fn' for method in struct body")
                self.advance()  # Skip unexpected token
        
        # Store struct node
        self.struct_nodes.append(struct_node)
        let node_ref = len(self.struct_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.STRUCT)
        
        return struct_node
    
    fn parse_struct_field(inout self) -> FieldNode:
        """Parse a struct field declaration.
        
        Returns:
            The field node.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'var'
        
        # Parse field name
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected field name")
            return FieldNode("error", TypeNode("Unknown", location), location)
        
        let name = self.current_token.text
        self.advance()
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after field name")
            return FieldNode(name, TypeNode("Unknown", location), location)
        self.advance()
        
        # Parse field type
        let field_type = self.parse_type()
        
        # Create field node
        var field = FieldNode(name, field_type, location)
        
        # Parse optional default value
        if self.current_token.kind.kind == TokenKind.EQUAL:
            self.advance()
            field.default_value = self.parse_expression()
        
        return field
    
    fn parse_trait(inout self) -> TraitNode:
        """Parse a trait definition.
        
        Traits define interfaces that structs can implement.
        Example:
            trait Hashable:
                fn hash(self) -> Int
                fn equals(self, other: Self) -> Bool
        
        Returns:
            The trait AST node.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'trait'
        
        # Parse trait name
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected trait name")
            return TraitNode("Error", location)
        
        let name = self.current_token.text
        self.advance()
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after trait name")
        else:
            self.advance()
        
        # Create trait node
        var trait_node = TraitNode(name, location)
        
        # Expect newline and indentation
        if self.current_token.kind.kind == TokenKind.NEWLINE:
            self.advance()
        
        # Parse trait body (method signatures)
        while (self.current_token.kind.kind != TokenKind.EOF and
               self.current_token.kind.kind != TokenKind.DEDENT):
            
            # Skip extra newlines
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
                continue
            
            # Traits can only contain method signatures (fn keyword)
            if self.current_token.kind.kind == TokenKind.FN:
                let method_sig = self.parse_function()
                trait_node.methods.append(method_sig)
            else:
                self.error("Expected method signature in trait body (traits can only contain 'fn' declarations)")
                self.advance()  # Skip unexpected token
        
        # Store trait node
        self.trait_nodes.append(trait_node)
        let node_ref = len(self.trait_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.TRAIT)
        
        return trait_node
    
    fn parse_statement(inout self) -> ASTNodeRef:
        """Parse a statement.
        
        Returns:
            The statement AST node reference.
        """
        # Control flow statements (Phase 2)
        if self.current_token.kind.kind == TokenKind.IF:
            return self.parse_if_statement()
        
        if self.current_token.kind.kind == TokenKind.WHILE:
            return self.parse_while_statement()
        
        if self.current_token.kind.kind == TokenKind.FOR:
            return self.parse_for_statement()
        
        if self.current_token.kind.kind == TokenKind.BREAK:
            return self.parse_break_statement()
        
        if self.current_token.kind.kind == TokenKind.CONTINUE:
            return self.parse_continue_statement()
        
        if self.current_token.kind.kind == TokenKind.PASS:
            return self.parse_pass_statement()
        
        # Return statement
        if self.current_token.kind.kind == TokenKind.RETURN:
            return self.parse_return_statement()
        
        # Variable declaration
        if self.current_token.kind.kind == TokenKind.VAR or self.current_token.kind.kind == TokenKind.LET:
            return self.parse_var_declaration()
        
        # Expression statement (e.g., function call)
        return self.parse_expression_statement()
    
    fn parse_return_statement(inout self) -> ASTNodeRef:
        """Parse a return statement.
        
        Returns:
            The return statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'return'
        
        # Parse optional return value
        var value: ASTNodeRef = 0  # 0 represents None/empty
        if self.current_token.kind.kind != TokenKind.NEWLINE and self.current_token.kind.kind != TokenKind.EOF:
            value = self.parse_expression()
        
        # Create and store return statement node
        let return_node = ReturnStmtNode(value, location)
        self.return_nodes.append(return_node)
        let node_ref = len(self.return_nodes) - 1
        # Register with node store
        _ = self.node_store.register_node(node_ref, ASTNodeKind.RETURN_STMT)
        return node_ref
    
    fn parse_var_declaration(inout self) -> ASTNodeRef:
        """Parse a variable declaration.
        
        Returns:
            The variable declaration node reference.
        """
        let location = self.current_token.location
        let is_var = self.current_token.kind.kind == TokenKind.VAR
        self.advance()  # Skip 'var' or 'let'
        
        # Parse variable name
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected variable name")
            return 0
        
        let name = self.current_token.text
        let name_location = self.current_token.location
        self.advance()
        
        # Parse optional type annotation
        var var_type = TypeNode("Unknown", name_location)
        if self.current_token.kind.kind == TokenKind.COLON:
            self.advance()
            var_type = self.parse_type()
        
        # Parse initializer
        var init: ASTNodeRef = 0
        if self.current_token.kind.kind == TokenKind.EQUAL:
            self.advance()
            init = self.parse_expression()
        
        # Create and store variable declaration node
        let var_decl = VarDeclNode(name, var_type, init, location)
        self.var_decl_nodes.append(var_decl)
        let node_ref = len(self.var_decl_nodes) - 1
        # Register with node store
        _ = self.node_store.register_node(node_ref, ASTNodeKind.VAR_DECL)
        return node_ref
    
    fn parse_expression_statement(inout self) -> ASTNodeRef:
        """Parse an expression statement.
        
        Returns:
            The expression node reference.
        """
        return self.parse_expression()
    
    fn parse_if_statement(inout self) -> ASTNodeRef:
        """Parse an if statement with optional elif and else blocks.
        
        Returns:
            The if statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'if'
        
        # Parse condition
        let condition = self.parse_expression()
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after if condition")
        else:
            self.advance()
        
        # Create if statement node
        var if_node = IfStmtNode(condition, location)
        
        # Parse then block
        self.parse_block(if_node.then_block)
        
        # Parse optional elif blocks
        while self.current_token.kind.kind == TokenKind.ELIF:
            self.advance()  # Skip 'elif'
            let elif_condition = self.parse_expression()
            
            if self.current_token.kind.kind != TokenKind.COLON:
                self.error("Expected ':' after elif condition")
            else:
                self.advance()
            
            var elif_block = List[ASTNodeRef]()
            self.parse_block(elif_block)
            
            if_node.elif_conditions.append(elif_condition)
            if_node.elif_blocks.append(elif_block)
        
        # Parse optional else block
        if self.current_token.kind.kind == TokenKind.ELSE:
            self.advance()  # Skip 'else'
            
            if self.current_token.kind.kind != TokenKind.COLON:
                self.error("Expected ':' after else")
            else:
                self.advance()
            
            self.parse_block(if_node.else_block)
        
        # Store node
        self.if_stmt_nodes.append(if_node)
        let node_ref = len(self.if_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.IF_STMT)
        return node_ref
    
    fn parse_while_statement(inout self) -> ASTNodeRef:
        """Parse a while loop.
        
        Returns:
            The while statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'while'
        
        # Parse condition
        let condition = self.parse_expression()
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after while condition")
        else:
            self.advance()
        
        # Create while statement node
        var while_node = WhileStmtNode(condition, location)
        
        # Parse body
        self.parse_block(while_node.body)
        
        # Store node
        self.while_stmt_nodes.append(while_node)
        let node_ref = len(self.while_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.WHILE_STMT)
        return node_ref
    
    fn parse_for_statement(inout self) -> ASTNodeRef:
        """Parse a for loop.
        
        Returns:
            The for statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'for'
        
        # Parse iterator variable
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected iterator variable name")
            return 0
        
        let iterator = self.current_token.text
        self.advance()
        
        # Expect 'in'
        if self.current_token.kind.kind != TokenKind.IN:
            self.error("Expected 'in' after iterator variable")
            return 0
        self.advance()
        
        # Parse collection expression
        let collection = self.parse_expression()
        
        # Expect colon
        if self.current_token.kind.kind != TokenKind.COLON:
            self.error("Expected ':' after for header")
        else:
            self.advance()
        
        # Create for statement node
        var for_node = ForStmtNode(iterator, collection, location)
        
        # Parse body
        self.parse_block(for_node.body)
        
        # Store node
        self.for_stmt_nodes.append(for_node)
        let node_ref = len(self.for_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.FOR_STMT)
        return node_ref
    
    fn parse_break_statement(inout self) -> ASTNodeRef:
        """Parse a break statement.
        
        Returns:
            The break statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'break'
        
        # Create and store break statement node
        let break_node = BreakStmtNode(location)
        self.break_stmt_nodes.append(break_node)
        let node_ref = len(self.break_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.BREAK_STMT)
        return node_ref
    
    fn parse_continue_statement(inout self) -> ASTNodeRef:
        """Parse a continue statement.
        
        Returns:
            The continue statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'continue'
        
        # Create and store continue statement node
        let continue_node = ContinueStmtNode(location)
        self.continue_stmt_nodes.append(continue_node)
        let node_ref = len(self.continue_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.CONTINUE_STMT)
        return node_ref
    
    fn parse_pass_statement(inout self) -> ASTNodeRef:
        """Parse a pass statement.
        
        Returns:
            The pass statement node reference.
        """
        let location = self.current_token.location
        self.advance()  # Skip 'pass'
        
        # Create and store pass statement node
        let pass_node = PassStmtNode(location)
        self.pass_stmt_nodes.append(pass_node)
        let node_ref = len(self.pass_stmt_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.PASS_STMT)
        return node_ref
    
    fn parse_block(inout self, inout block: List[ASTNodeRef]):
        """Parse a block of statements (for if/while/for bodies).
        
        Args:
            block: The list to append parsed statements to.
        """
        # Expect newline after colon
        if self.current_token.kind.kind == TokenKind.NEWLINE:
            self.advance()
        
        # Parse statements until we hit dedent or a keyword that ends the block
        while (self.current_token.kind.kind != TokenKind.EOF and
               self.current_token.kind.kind != TokenKind.DEDENT and
               self.current_token.kind.kind != TokenKind.ELIF and
               self.current_token.kind.kind != TokenKind.ELSE):
            
            # Skip extra newlines
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
                continue
            
            let stmt = self.parse_statement()
            block.append(stmt)
            
            # Skip newline after statement
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
    
    fn parse_expression(inout self) -> ASTNodeRef:
        """Parse an expression.
        
        Returns:
            The expression AST node reference.
        """
        # Parse binary expressions with operator precedence
        return self.parse_binary_expression(0)
    
    fn parse_binary_expression(inout self, min_precedence: Int) -> ASTNodeRef:
        """Parse binary expressions with precedence climbing.
        
        Args:
            min_precedence: Minimum operator precedence to consider.
            
        Returns:
            The expression node reference.
        """
        # Check for unary operators first
        var left = self.parse_unary_expression()
        
        # Parse operators with precedence
        while True:
            let op_token = self.current_token
            
            # Check if current token is a binary operator
            if not self.is_binary_operator(op_token.kind.kind):
                break
            
            let precedence = self.get_operator_precedence(op_token.kind.kind)
            if precedence < min_precedence:
                break
            
            let operator = op_token.text
            let op_location = op_token.location
            self.advance()  # Consume operator
            
            # Parse right operand with higher precedence
            let right = self.parse_binary_expression(precedence + 1)
            
            # Create binary expression node
            let binary_node = BinaryExprNode(operator, left, right, op_location)
            self.binary_expr_nodes.append(binary_node)
            let node_ref = len(self.binary_expr_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.BINARY_EXPR)
            left = node_ref
        
        return left
    
    fn parse_unary_expression(inout self) -> ASTNodeRef:
        """Parse unary expressions (-, !, ~).
        
        Returns:
            The expression node reference.
        """
        # Check for unary operators
        if (self.current_token.kind.kind == TokenKind.MINUS or
            self.current_token.kind.kind == TokenKind.EXCLAMATION or
            self.current_token.kind.kind == TokenKind.TILDE):
            let operator = self.current_token.text
            let location = self.current_token.location
            self.advance()  # Consume operator
            
            # Parse the operand (recursively to handle multiple unary operators)
            let operand = self.parse_unary_expression()
            
            # Create unary expression node
            let unary_node = UnaryExprNode(operator, operand, location)
            self.unary_expr_nodes.append(unary_node)
            let node_ref = len(self.unary_expr_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.UNARY_EXPR)
            return node_ref
        
        # Not a unary operator, parse postfix expression (primary + member access)
        return self.parse_postfix_expression()
    
    fn parse_postfix_expression(inout self) -> ASTNodeRef:
        """Parse postfix expressions (member access, method calls).
        
        Returns:
            The expression node reference.
        """
        var expr = self.parse_primary_expression()
        
        # Handle postfix operators (member access with dot)
        while self.current_token.kind.kind == TokenKind.DOT:
            let dot_location = self.current_token.location
            self.advance()  # Skip '.'
            
            # Expect member name
            if self.current_token.kind.kind != TokenKind.IDENTIFIER:
                self.error("Expected member name after '.'")
                return expr
            
            let member_name = self.current_token.text
            self.advance()
            
            # Check if this is a method call (followed by parentheses)
            if self.current_token.kind.kind == TokenKind.LEFT_PAREN:
                # Parse method call
                self.advance()  # Skip '('
                
                var member_node = MemberAccessNode(expr, member_name, dot_location, is_method_call=True)
                
                # Parse method arguments
                while self.current_token.kind.kind != TokenKind.RIGHT_PAREN and self.current_token.kind.kind != TokenKind.EOF:
                    let arg = self.parse_expression()
                    member_node.add_argument(arg)
                    
                    if self.current_token.kind.kind == TokenKind.COMMA:
                        self.advance()
                    elif self.current_token.kind.kind != TokenKind.RIGHT_PAREN:
                        break
                
                if not self.expect(TokenKind(TokenKind.RIGHT_PAREN)):
                    self.error("Expected ')' after method arguments")
                
                # Store member access node
                self.member_access_nodes.append(member_node)
                let node_ref = len(self.member_access_nodes) - 1
                _ = self.node_store.register_node(node_ref, ASTNodeKind.MEMBER_ACCESS)
                expr = node_ref
            else:
                # Field access
                let member_node = MemberAccessNode(expr, member_name, dot_location, is_method_call=False)
                self.member_access_nodes.append(member_node)
                let node_ref = len(self.member_access_nodes) - 1
                _ = self.node_store.register_node(node_ref, ASTNodeKind.MEMBER_ACCESS)
                expr = node_ref
        
        return expr
    
    fn is_binary_operator(self, kind: Int) -> Bool:
        """Check if token kind is a binary operator.
        
        Args:
            kind: The token kind.
            
        Returns:
            True if it's a binary operator.
        """
        return (kind == TokenKind.PLUS or kind == TokenKind.MINUS or
                kind == TokenKind.STAR or kind == TokenKind.SLASH or
                kind == TokenKind.PERCENT or kind == TokenKind.DOUBLE_STAR or
                kind == TokenKind.EQUAL_EQUAL or kind == TokenKind.NOT_EQUAL or
                kind == TokenKind.LESS or kind == TokenKind.LESS_EQUAL or
                kind == TokenKind.GREATER or kind == TokenKind.GREATER_EQUAL or
                kind == TokenKind.DOUBLE_AMPERSAND or kind == TokenKind.DOUBLE_PIPE)
    
    fn get_operator_precedence(self, kind: Int) -> Int:
        """Get operator precedence level.
        
        Args:
            kind: The token kind.
            
        Returns:
            Precedence level (higher = tighter binding).
        """
        # Logical OR: ||
        if kind == TokenKind.DOUBLE_PIPE:
            return 1
        
        # Logical AND: &&
        if kind == TokenKind.DOUBLE_AMPERSAND:
            return 2
        
        # Comparison operators: ==, !=, <, <=, >, >=
        if (kind == TokenKind.EQUAL_EQUAL or kind == TokenKind.NOT_EQUAL or
            kind == TokenKind.LESS or kind == TokenKind.LESS_EQUAL or
            kind == TokenKind.GREATER or kind == TokenKind.GREATER_EQUAL):
            return 3
        
        # Addition and subtraction: +, -
        if kind == TokenKind.PLUS or kind == TokenKind.MINUS:
            return 4
        
        # Multiplication, division, modulo: *, /, %
        if kind == TokenKind.STAR or kind == TokenKind.SLASH or kind == TokenKind.PERCENT:
            return 5
        
        # Exponentiation: **
        if kind == TokenKind.DOUBLE_STAR:
            return 6
        
        return 0  # Unknown operator
    
    fn parse_primary_expression(inout self) -> ASTNodeRef:
        """Parse a primary expression (literals, identifiers, calls).
        
        Returns:
            The expression node reference.
        """
        # Integer literal
        if self.current_token.kind.kind == TokenKind.INTEGER_LITERAL:
            let value = self.current_token.text
            let location = self.current_token.location
            self.advance()
            let int_node = IntegerLiteralNode(value, location)
            self.int_literal_nodes.append(int_node)
            let node_ref = len(self.int_literal_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.INTEGER_LITERAL)
            return node_ref
        
        # Float literal
        if self.current_token.kind.kind == TokenKind.FLOAT_LITERAL:
            let value = self.current_token.text
            let location = self.current_token.location
            self.advance()
            let float_node = FloatLiteralNode(value, location)
            self.float_literal_nodes.append(float_node)
            let node_ref = len(self.float_literal_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.FLOAT_LITERAL)
            return node_ref
        
        # String literal
        if self.current_token.kind.kind == TokenKind.STRING_LITERAL:
            let value = self.current_token.text
            let location = self.current_token.location
            self.advance()
            let string_node = StringLiteralNode(value, location)
            self.string_literal_nodes.append(string_node)
            let node_ref = len(self.string_literal_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.STRING_LITERAL)
            return node_ref
        
        # Identifier or function call
        if self.current_token.kind.kind == TokenKind.IDENTIFIER:
            let name = self.current_token.text
            let location = self.current_token.location
            self.advance()
            
            # Check for function call
            if self.current_token.kind.kind == TokenKind.LEFT_PAREN:
                return self.parse_call_expression(name, location)
            
            # Just an identifier
            let ident_node = IdentifierExprNode(name, location)
            self.identifier_nodes.append(ident_node)
            let node_ref = len(self.identifier_nodes) - 1
            _ = self.node_store.register_node(node_ref, ASTNodeKind.IDENTIFIER_EXPR)
            return node_ref
        
        # Parenthesized expression
        if self.current_token.kind.kind == TokenKind.LEFT_PAREN:
            self.advance()
            let expr = self.parse_expression()
            if not self.expect(TokenKind(TokenKind.RIGHT_PAREN)):
                self.error("Expected ')'")
            return expr
        
        self.error("Expected expression")
        return 0  # Error placeholder
    
    fn parse_call_expression(inout self, callee: String, location: SourceLocation) -> ASTNodeRef:
        """Parse a function call expression.
        
        Args:
            callee: The function name being called.
            location: Source location of the call.
            
        Returns:
            The call expression node reference.
        """
        self.advance()  # Skip '('
        
        var call_node = CallExprNode(callee, location)
        
        # Parse arguments
        while self.current_token.kind.kind != TokenKind.RIGHT_PAREN and self.current_token.kind.kind != TokenKind.EOF:
            let arg = self.parse_expression()
            call_node.add_argument(arg)
            
            # Check for comma
            if self.current_token.kind.kind == TokenKind.COMMA:
                self.advance()
            elif self.current_token.kind.kind != TokenKind.RIGHT_PAREN:
                break
        
        if not self.expect(TokenKind(TokenKind.RIGHT_PAREN)):
            self.error("Expected ')'")
        
        # Store and return call expression node
        self.call_expr_nodes.append(call_node)
        let node_ref = len(self.call_expr_nodes) - 1
        _ = self.node_store.register_node(node_ref, ASTNodeKind.CALL_EXPR)
        return node_ref
    
    fn parse_type(inout self) -> TypeNode:
        """Parse a type annotation.
        
        Returns:
            The type AST node.
        """
        if self.current_token.kind.kind != TokenKind.IDENTIFIER:
            self.error("Expected type name")
            return TypeNode("Error", self.current_token.location)
        
        let type_name = self.current_token.text
        let location = self.current_token.location
        self.advance()
        
        # TODO: Handle parametric types like List[Int] in Phase 2
        
        return TypeNode(type_name, location)
    
    fn parse_parameters(inout self, inout func: FunctionNode):
        """Parse function parameters and add them to the function.
        
        Args:
            func: The function node to add parameters to.
        """
        # Skip if no parameters (empty parens)
        if self.current_token.kind.kind == TokenKind.RIGHT_PAREN:
            return
        
        while True:
            # Parse parameter name
            if self.current_token.kind.kind != TokenKind.IDENTIFIER:
                self.error("Expected parameter name")
                break
            
            let name = self.current_token.text
            let location = self.current_token.location
            self.advance()
            
            # Parse type annotation (required for parameters)
            var param_type = TypeNode("Unknown", location)
            if self.current_token.kind.kind == TokenKind.COLON:
                self.advance()
                param_type = self.parse_type()
            else:
                self.error("Expected ':' after parameter name")
            
            # Create parameter node
            let param = ParameterNode(name, param_type, location)
            func.parameters.append(param)
            
            # Check for more parameters
            if self.current_token.kind.kind != TokenKind.COMMA:
                break
            self.advance()  # Skip comma
    
    fn parse_function_body(inout self, inout func: FunctionNode):
        """Parse statements in a function body.
        
        Args:
            func: The function node to add body statements to.
        """
        # Expect newline after colon
        if self.current_token.kind.kind == TokenKind.NEWLINE:
            self.advance()
        
        # Parse statements until EOF or we see a dedent-like pattern
        # For Phase 1, we use a simplified indentation model:
        # - Continue parsing statements while we have valid statement starts
        # - Stop at EOF or when we see a top-level keyword (fn, struct)
        while self.current_token.kind.kind != TokenKind.EOF:
            # Skip extra newlines
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
                continue
            
            # Stop if we hit a top-level declaration keyword
            if self.current_token.kind.kind == TokenKind.FN or self.current_token.kind.kind == TokenKind.STRUCT:
                break
            
            # Parse statement
            let stmt = self.parse_statement()
            func.body.append(stmt)
            
            # Expect newline after statement
            if self.current_token.kind.kind == TokenKind.NEWLINE:
                self.advance()
            elif self.current_token.kind.kind == TokenKind.EOF:
                break
            else:
                # If not newline or EOF, might be an error
                # But continue parsing to collect more errors
                pass
    
    fn expect(inout self, kind: TokenKind) -> Bool:
        """Check if current token matches expected kind and advance.
        
        Args:
            kind: The expected token kind.
            
        Returns:
            True if matched, False otherwise.
        """
        if self.current_token.kind.kind == kind.kind:
            self.advance()
            return True
        return False
    
    fn advance(inout self):
        """Advance to the next token."""
        self.current_token = self.lexer.next_token()
    
    fn error(inout self, message: String):
        """Report a parse error.
        
        Args:
            message: The error message.
        """
        let loc = self.current_token.location
        let error_msg = str(loc) + ": error: " + message
        self.errors.append(error_msg)
    
    fn has_errors(self) -> Bool:
        """Check if any errors were encountered.
        
        Returns:
            True if there were errors, False otherwise.
        """
        return len(self.errors) > 0
