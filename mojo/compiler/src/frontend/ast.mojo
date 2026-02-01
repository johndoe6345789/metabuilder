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

"""Abstract Syntax Tree node definitions for the Mojo compiler.

This module defines all AST node types used by the parser.
The AST represents the syntactic structure of Mojo programs.
"""

from collections import List
from .source_location import SourceLocation


@value
struct ASTNodeKind:
    """Represents the kind of an AST node."""
    
    # Top-level constructs
    alias MODULE = 0
    alias FUNCTION = 1
    alias STRUCT = 2
    alias TRAIT = 3
    
    # Statements
    alias VAR_DECL = 10
    alias RETURN_STMT = 11
    alias EXPR_STMT = 12
    alias IF_STMT = 13
    alias WHILE_STMT = 14
    alias FOR_STMT = 15
    alias PASS_STMT = 16
    alias BREAK_STMT = 17
    alias CONTINUE_STMT = 18
    
    # Expressions
    alias BINARY_EXPR = 20
    alias UNARY_EXPR = 21
    alias CALL_EXPR = 22
    alias IDENTIFIER_EXPR = 23
    alias INTEGER_LITERAL = 24
    alias FLOAT_LITERAL = 25
    alias STRING_LITERAL = 26
    alias BOOL_LITERAL = 27
    alias MEMBER_ACCESS = 28
    
    # Types
    alias TYPE_NAME = 30
    alias PARAMETRIC_TYPE = 31
    alias REFERENCE_TYPE = 32
    alias TYPE_PARAMETER = 33
    alias LIFETIME_PARAMETER = 34
    
    var kind: Int
    
    fn __init__(inout self, kind: Int):
        self.kind = kind


struct ModuleNode:
    """Represents a Mojo module (file).
    
    A module contains top-level declarations like functions, structs, and imports.
    """
    
    var declarations: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(inout self, location: SourceLocation):
        """Initialize a module node.
        
        Args:
            location: Source location of the module.
        """
        self.declarations = List[ASTNodeRef]()
        self.location = location
    
    fn add_declaration(inout self, decl: ASTNodeRef):
        """Add a declaration to the module.
        
        Args:
            decl: The declaration to add.
        """
        self.declarations.append(decl)


struct FunctionNode:
    """Represents a function definition.
    
    Example: fn add(a: Int, b: Int) -> Int: return a + b
    Example (generic): fn identity[T](x: T) -> T: return x
    """
    
    var name: String
    var type_params: List[TypeParameterNode]  # Generic type parameters
    var parameters: List[ParameterNode]
    var return_type: TypeNode
    var body: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(
        inout self,
        name: String,
        location: SourceLocation
    ):
        """Initialize a function node.
        
        Args:
            name: The function name.
            location: Source location of the function.
        """
        self.name = name
        self.type_params = List[TypeParameterNode]()
        self.parameters = List[ParameterNode]()
        self.return_type = TypeNode("None", location)
        self.body = List[ASTNodeRef]()
        self.location = location


struct ParameterNode:
    """Represents a function parameter.
    
    Example: a: Int
    """
    
    var name: String
    var param_type: TypeNode
    var location: SourceLocation
    
    fn __init__(
        inout self,
        name: String,
        param_type: TypeNode,
        location: SourceLocation
    ):
        """Initialize a parameter node.
        
        Args:
            name: The parameter name.
            param_type: The parameter type.
            location: Source location of the parameter.
        """
        self.name = name
        self.param_type = param_type
        self.location = location


struct TypeNode:
    """Represents a type annotation.
    
    Example: Int, String, List[Int], &T, &mut T
    """
    
    var name: String
    var type_params: List[TypeNode]  # For generics like List[Int]
    var is_reference: Bool  # For &T
    var is_mutable_reference: Bool  # For &mut T
    var location: SourceLocation
    
    fn __init__(inout self, name: String, location: SourceLocation):
        """Initialize a type node.
        
        Args:
            name: The type name.
            location: Source location of the type.
        """
        self.name = name
        self.type_params = List[TypeNode]()
        self.is_reference = False
        self.is_mutable_reference = False
        self.location = location


struct VarDeclNode:
    """Represents a variable declaration.
    
    Example: var x: Int = 42
    """
    
    var name: String
    var var_type: TypeNode
    var initializer: ASTNodeRef
    var location: SourceLocation
    
    fn __init__(
        inout self,
        name: String,
        var_type: TypeNode,
        initializer: ASTNodeRef,
        location: SourceLocation
    ):
        """Initialize a variable declaration node.
        
        Args:
            name: The variable name.
            var_type: The variable type.
            initializer: The initial value expression.
            location: Source location of the declaration.
        """
        self.name = name
        self.var_type = var_type
        self.initializer = initializer
        self.location = location


struct ReturnStmtNode:
    """Represents a return statement.
    
    Example: return x + y
    """
    
    var value: ASTNodeRef
    var location: SourceLocation
    
    fn __init__(inout self, value: ASTNodeRef, location: SourceLocation):
        """Initialize a return statement node.
        
        Args:
            value: The value to return (may be None).
            location: Source location of the statement.
        """
        self.value = value
        self.location = location


struct BinaryExprNode:
    """Represents a binary expression.
    
    Example: a + b, x * y, a == b
    """
    
    var operator: String
    var left: ASTNodeRef
    var right: ASTNodeRef
    var location: SourceLocation
    
    fn __init__(
        inout self,
        operator: String,
        left: ASTNodeRef,
        right: ASTNodeRef,
        location: SourceLocation
    ):
        """Initialize a binary expression node.
        
        Args:
            operator: The operator symbol (+, -, *, /, ==, etc.).
            left: The left operand.
            right: The right operand.
            location: Source location of the expression.
        """
        self.operator = operator
        self.left = left
        self.right = right
        self.location = location


struct CallExprNode:
    """Represents a function call expression.
    
    Example: print("Hello"), add(1, 2)
    """
    
    var callee: String
    var arguments: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(
        inout self,
        callee: String,
        location: SourceLocation
    ):
        """Initialize a call expression node.
        
        Args:
            callee: The function name being called.
            location: Source location of the call.
        """
        self.callee = callee
        self.arguments = List[ASTNodeRef]()
        self.location = location
    
    fn add_argument(inout self, arg: ASTNodeRef):
        """Add an argument to the call.
        
        Args:
            arg: The argument expression.
        """
        self.arguments.append(arg)


struct MemberAccessNode:
    """Represents a member access expression.
    
    Example: obj.field, point.x, rect.area()
    """
    
    var object: ASTNodeRef  # The object being accessed
    var member: String  # The member name (field or method)
    var is_method_call: Bool  # True if this is a method call
    var arguments: List[ASTNodeRef]  # Arguments if it's a method call
    var location: SourceLocation
    
    fn __init__(
        inout self,
        object: ASTNodeRef,
        member: String,
        location: SourceLocation,
        is_method_call: Bool = False
    ):
        """Initialize a member access node.
        
        Args:
            object: The object whose member is being accessed.
            member: The name of the member.
            location: Source location of the access.
            is_method_call: Whether this is a method call.
        """
        self.object = object
        self.member = member
        self.location = location
        self.is_method_call = is_method_call
        self.arguments = List[ASTNodeRef]()
    
    fn add_argument(inout self, arg: ASTNodeRef):
        """Add an argument to the method call.
        
        Args:
            arg: The argument expression.
        """
        self.arguments.append(arg)


struct IdentifierExprNode:
    """Represents an identifier expression.
    
    Example: x, variable_name
    """
    
    var name: String
    var location: SourceLocation
    
    fn __init__(inout self, name: String, location: SourceLocation):
        """Initialize an identifier expression node.
        
        Args:
            name: The identifier name.
            location: Source location of the identifier.
        """
        self.name = name
        self.location = location


struct IntegerLiteralNode:
    """Represents an integer literal.
    
    Example: 42, 0, -10
    """
    
    var value: String
    var location: SourceLocation
    
    fn __init__(inout self, value: String, location: SourceLocation):
        """Initialize an integer literal node.
        
        Args:
            value: The integer value as a string.
            location: Source location of the literal.
        """
        self.value = value
        self.location = location


struct FloatLiteralNode:
    """Represents a float literal.
    
    Example: 3.14, 0.5, -2.718
    """
    
    var value: String
    var location: SourceLocation
    
    fn __init__(inout self, value: String, location: SourceLocation):
        """Initialize a float literal node.
        
        Args:
            value: The float value as a string.
            location: Source location of the literal.
        """
        self.value = value
        self.location = location


struct StringLiteralNode:
    """Represents a string literal.
    
    Example: "Hello, World!", 'test'
    """
    
    var value: String
    var location: SourceLocation
    
    fn __init__(inout self, value: String, location: SourceLocation):
        """Initialize a string literal node.
        
        Args:
            value: The string content.
            location: Source location of the literal.
        """
        self.value = value
        self.location = location


struct BoolLiteralNode:
    """Represents a boolean literal.
    
    Example: True, False
    """
    
    var value: Bool
    var location: SourceLocation
    
    fn __init__(inout self, value: Bool, location: SourceLocation):
        """Initialize a boolean literal node.
        
        Args:
            value: The boolean value.
            location: Source location of the literal.
        """
        self.value = value
        self.location = location


struct IfStmtNode:
    """Represents an if statement with optional elif and else blocks.
    
    Example:
        if condition:
            body
        elif other_condition:
            elif_body
        else:
            else_body
    """
    
    var condition: ASTNodeRef
    var then_block: List[ASTNodeRef]
    var elif_conditions: List[ASTNodeRef]
    var elif_blocks: List[List[ASTNodeRef]]
    var else_block: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(inout self, condition: ASTNodeRef, location: SourceLocation):
        """Initialize an if statement node.
        
        Args:
            condition: The condition expression.
            location: Source location of the if statement.
        """
        self.condition = condition
        self.then_block = List[ASTNodeRef]()
        self.elif_conditions = List[ASTNodeRef]()
        self.elif_blocks = List[List[ASTNodeRef]]()
        self.else_block = List[ASTNodeRef]()
        self.location = location


struct WhileStmtNode:
    """Represents a while loop.
    
    Example:
        while condition:
            body
    """
    
    var condition: ASTNodeRef
    var body: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(inout self, condition: ASTNodeRef, location: SourceLocation):
        """Initialize a while statement node.
        
        Args:
            condition: The loop condition expression.
            location: Source location of the while statement.
        """
        self.condition = condition
        self.body = List[ASTNodeRef]()
        self.location = location


struct ForStmtNode:
    """Represents a for loop.
    
    Example:
        for item in collection:
            body
    """
    
    var iterator: String  # Variable name
    var collection: ASTNodeRef
    var body: List[ASTNodeRef]
    var location: SourceLocation
    
    fn __init__(inout self, iterator: String, collection: ASTNodeRef, location: SourceLocation):
        """Initialize a for statement node.
        
        Args:
            iterator: The loop variable name.
            collection: The collection expression.
            location: Source location of the for statement.
        """
        self.iterator = iterator
        self.collection = collection
        self.body = List[ASTNodeRef]()
        self.location = location


struct BreakStmtNode:
    """Represents a break statement.
    
    Example: break
    """
    
    var location: SourceLocation
    
    fn __init__(inout self, location: SourceLocation):
        """Initialize a break statement node.
        
        Args:
            location: Source location of the break statement.
        """
        self.location = location


struct ContinueStmtNode:
    """Represents a continue statement.
    
    Example: continue
    """
    
    var location: SourceLocation
    
    fn __init__(inout self, location: SourceLocation):
        """Initialize a continue statement node.
        
        Args:
            location: Source location of the continue statement.
        """
        self.location = location


struct PassStmtNode:
    """Represents a pass statement (no-op).
    
    Example: pass
    """
    
    var location: SourceLocation
    
    fn __init__(inout self, location: SourceLocation):
        """Initialize a pass statement node.
        
        Args:
            location: Source location of the pass statement.
        """
        self.location = location


struct StructNode:
    """Represents a struct definition.
    
    Example:
        struct Point:
            var x: Int
            var y: Int
            
            fn __init__(inout self, x: Int, y: Int):
                self.x = x
                self.y = y
    
    Generic example (Phase 4):
        struct Box[T]:
            var value: T
    
    Structs can also declare trait conformance (Phase 3+):
        struct Point(Hashable):
            ...
    """
    
    var name: String
    var type_params: List[TypeParameterNode]  # Generic type parameters
    var fields: List[FieldNode]
    var methods: List[FunctionNode]
    var traits: List[String]  # Names of traits this struct implements
    var location: SourceLocation
    
    fn __init__(inout self, name: String, location: SourceLocation):
        """Initialize a struct node.
        
        Args:
            name: The struct name.
            location: Source location of the struct definition.
        """
        self.name = name
        self.type_params = List[TypeParameterNode]()
        self.fields = List[FieldNode]()
        self.methods = List[FunctionNode]()
        self.traits = List[String]()
        self.location = location


struct FieldNode:
    """Represents a struct field.
    
    Example: var x: Int
    """
    
    var name: String
    var field_type: TypeNode
    var default_value: ASTNodeRef  # 0 if no default
    var location: SourceLocation
    
    fn __init__(inout self, name: String, field_type: TypeNode, location: SourceLocation):
        """Initialize a field node.
        
        Args:
            name: The field name.
            field_type: The field type.
            location: Source location of the field.
        """
        self.name = name
        self.field_type = field_type
        self.default_value = 0
        self.location = location


struct TraitNode:
    """Represents a trait definition.
    
    Example:
        trait Hashable:
            fn hash(self) -> Int
    
    Generic example (Phase 4):
        trait Comparable[T]:
            fn compare(self, other: T) -> Int
    """
    
    var name: String
    var type_params: List[TypeParameterNode]  # Generic type parameters
    var methods: List[FunctionNode]  # Method signatures
    var location: SourceLocation
    
    fn __init__(inout self, name: String, location: SourceLocation):
        """Initialize a trait node.
        
        Args:
            name: The trait name.
            location: Source location of the trait definition.
        """
        self.name = name
        self.type_params = List[TypeParameterNode]()
        self.methods = List[FunctionNode]()
        self.location = location


struct UnaryExprNode:
    """Represents a unary expression.
    
    Example: -x, !flag, ~bits
    """
    
    var operator: String  # "-", "!", "~", etc.
    var operand: ASTNodeRef
    var location: SourceLocation
    
    fn __init__(inout self, operator: String, operand: ASTNodeRef, location: SourceLocation):
        """Initialize a unary expression node.
        
        Args:
            operator: The unary operator.
            operand: The operand expression.
            location: Source location of the expression.
        """
        self.operator = operator
        self.operand = operand
        self.location = location


struct TypeParameterNode:
    """Represents a generic type parameter.
    
    Example: T in struct Box[T], or K, V in struct Dict[K, V]
    """
    
    var name: String
    var constraints: List[String]  # Trait constraints (e.g., T: Comparable)
    var location: SourceLocation
    
    fn __init__(inout self, name: String, location: SourceLocation):
        """Initialize a type parameter node.
        
        Args:
            name: The type parameter name.
            location: Source location of the type parameter.
        """
        self.name = name
        self.constraints = List[String]()
        self.location = location


# Type alias for AST node references
# In a real implementation, this would be a variant/union type or trait object
alias ASTNodeRef = Int  # Placeholder - would be a proper reference type
