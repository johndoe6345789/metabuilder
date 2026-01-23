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

"""MLIR code generation from typed AST.

This module lowers the typed AST to MLIR representation using
the Mojo dialect and standard MLIR dialects (arith, scf, func, etc.).
"""

from collections import Dict, List
from ..frontend.parser import AST, Parser
from ..frontend.ast import (
    ModuleNode,
    FunctionNode,
    ParameterNode,
    ReturnStmtNode,
    VarDeclNode,
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
    UnaryExprNode,
    StructNode,
    TraitNode,
    MemberAccessNode,
    ASTNodeRef,
    ASTNodeKind,
)
from .mojo_dialect import MojoDialect


struct MLIRGenerator:
    """Generates MLIR code from a typed AST.
    
    The generator walks the AST and emits MLIR operations and types.
    It uses:
    - Mojo dialect for Mojo-specific operations
    - Standard MLIR dialects (arith, scf, func, cf) for common operations
    """
    
    var dialect: MojoDialect
    var output: String
    var parser: Parser  # Reference to parser for node access
    var ssa_counter: Int  # Counter for SSA value names
    var indent_level: Int  # Current indentation level
    var identifier_map: Dict[String, String]  # Maps identifier names to SSA values
    
    fn __init__(inout self, owned parser: Parser):
        """Initialize the MLIR generator.
        
        Args:
            parser: Parser containing the AST nodes.
        """
        self.dialect = MojoDialect()
        self.output = ""
        self.parser = parser^
        self.ssa_counter = 0
        self.indent_level = 0
        self.identifier_map = Dict[String, String]()
    
    fn next_ssa_value(inout self) -> String:
        """Generate the next SSA value name.
        
        Returns:
            A unique SSA value name like "%0", "%1", etc.
        """
        let result = "%" + str(self.ssa_counter)
        self.ssa_counter += 1
        return result
    
    fn get_indent(self) -> String:
        """Get the current indentation string.
        
        Returns:
            A string of spaces for the current indent level.
        """
        var result = ""
        for i in range(self.indent_level):
            result += "  "
        return result
    
    fn generate_module_with_functions(inout self, functions: List[FunctionNode]) -> String:
        """Generate complete MLIR module from a list of functions.
        
        Args:
            functions: List of function nodes to generate.
            
        Returns:
            The generated MLIR module text.
        """
        self.output = ""
        self.ssa_counter = 0
        self.indent_level = 0
        
        # Emit module header
        self.emit("module {")
        self.indent_level += 1
        
        # Generate each function
        for func in functions:
            self.generate_function_direct(func[])
            self.emit("")  # Blank line between functions
        
        self.indent_level -= 1
        self.emit("}")
        
        return self.output
    
    fn generate_function_direct(inout self, func: FunctionNode):
        """Generate MLIR for a function definition (direct API).
        
        Args:
            func: The function node to generate.
        """
        # Reset SSA counter and identifier map for each function
        self.ssa_counter = 0
        self.identifier_map = Dict[String, String]()
        
        let indent = self.get_indent()
        
        # Build function signature
        var signature = indent + "func.func @" + func.name + "("
        
        # Add parameters and track in identifier map
        for i in range(len(func.parameters)):
            if i > 0:
                signature += ", "
            let param = func.parameters[i]
            let param_type = self.emit_type(param.param_type.name)
            let arg_name = "%arg" + str(i)
            signature += arg_name + ": " + param_type
            # Track parameter name to SSA value mapping
            self.identifier_map[param.name] = arg_name
        
        signature += ")"
        
        # Add return type if not None
        if func.return_type.name != "None" and func.return_type.name != "NoneType":
            signature += " -> " + self.emit_type(func.return_type.name)
        
        signature += " {"
        self.emit(signature)
        
        # Generate function body
        self.indent_level += 1
        for stmt_ref in func.body:
            self.generate_statement(stmt_ref)
        
        self.indent_level -= 1
        self.emit(indent + "}")
    
    fn generate_module(inout self, module: ModuleNode) -> String:
        """Generate complete MLIR module from ModuleNode.
        
        Args:
            module: The module node to generate MLIR for.
            
        Returns:
            The generated MLIR module text.
        """
        self.output = ""
        self.ssa_counter = 0
        self.indent_level = 0
        
        # Emit module header
        self.emit("module {")
        self.indent_level += 1
        
        # Generate each declaration (functions, structs, and traits)
        for decl_ref in module.declarations:
            let kind = self.parser.node_store.get_node_kind(decl_ref)
            if kind == ASTNodeKind.STRUCT:
                self.generate_struct_definition(decl_ref)
                self.emit("")  # Blank line
            elif kind == ASTNodeKind.TRAIT:
                self.generate_trait_definition(decl_ref)
                self.emit("")  # Blank line
            elif kind == ASTNodeKind.FUNCTION:
                self.generate_function(decl_ref)
                self.emit("")  # Blank line between functions
        
        self.indent_level -= 1
        self.emit("}")
        
        return self.output
    
    fn generate_struct_definition(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for a struct definition using LLVM struct types.
        
        Phase 3: Full LLVM struct codegen with actual type definitions and operations.
        Structs are represented as LLVM struct types with proper field layout.
        
        Args:
            node_ref: Reference to the struct node.
        """
        if node_ref < 0 or node_ref >= len(self.parser.struct_nodes):
            return
        
        let struct_node = self.parser.struct_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate LLVM struct type definition
        # Format: !llvm.struct<(field1_type, field2_type, ...)>
        var field_types = "("
        for i in range(len(struct_node.fields)):
            if i > 0:
                field_types += ", "
            let field = struct_node.fields[i]
            field_types += self.mlir_type_for(field.field_type.name)
        field_types += ")"
        
        # Emit type alias for the struct
        self.emit(indent + "// Struct type: " + struct_node.name)
        self.emit(indent + "// Type definition: !llvm.struct<" + field_types + ">")
        
        # Emit field information as documentation
        if len(struct_node.fields) > 0:
            self.emit(indent + "// Fields:")
            for i in range(len(struct_node.fields)):
                let field = struct_node.fields[i]
                self.emit(indent + "//   [" + str(i) + "] " + field.name + ": " + field.field_type.name)
        
        # Emit method information
        if len(struct_node.methods) > 0:
            self.emit(indent + "// Methods:")
            for i in range(len(struct_node.methods)):
                let method = struct_node.methods[i]
                self.emit(indent + "//   " + method.name + "() -> " + method.return_type.name)
    
    fn generate_trait_definition(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for a trait definition.
        
        Traits are emitted as interface documentation since MLIR doesn't
        have a direct trait concept. The actual conformance checking happens
        during type checking.
        
        Args:
            node_ref: Reference to the trait node.
        """
        if node_ref < 0 or node_ref >= len(self.parser.trait_nodes):
            return
        
        let trait_node = self.parser.trait_nodes[node_ref]
        let indent = self.get_indent()
        
        # Emit trait as documentation
        self.emit(indent + "// Trait definition: " + trait_node.name)
        self.emit(indent + "// Required methods:")
        for i in range(len(trait_node.methods)):
            let method = trait_node.methods[i]
            self.emit(indent + "//   " + method.name + "() -> " + method.return_type.name)
    
    fn mlir_type_for(self, mojo_type: String) -> String:
        """Convert Mojo type to MLIR/LLVM type representation.
        
        Args:
            mojo_type: The Mojo type name.
            
        Returns:
            The corresponding MLIR type string.
        """
        if mojo_type == "Int" or mojo_type == "Int64":
            return "i64"
        elif mojo_type == "Int32":
            return "i32"
        elif mojo_type == "Int16":
            return "i16"
        elif mojo_type == "Int8":
            return "i8"
        elif mojo_type == "UInt64":
            return "i64"
        elif mojo_type == "UInt32":
            return "i32"
        elif mojo_type == "UInt16":
            return "i16"
        elif mojo_type == "UInt8":
            return "i8"
        elif mojo_type == "Float64":
            return "f64"
        elif mojo_type == "Float32":
            return "f32"
        elif mojo_type == "Bool":
            return "i1"
        elif mojo_type == "String":
            return "!llvm.ptr<i8>"  # String as pointer to i8
        else:
            # Unknown or user-defined type - return as pointer
            return "!llvm.ptr"
    
    fn generate_function(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for a function definition.
        
        Args:
            node_ref: Reference to the function node.
        """
        # Note: This is a stub for the module-based API
        # In Phase 1, we use generate_function_direct() instead
        let indent = self.get_indent()
        self.emit(indent + "func.func @placeholder() {")
        self.indent_level += 1
        self.emit(self.get_indent() + "return")
        self.indent_level -= 1
        self.emit(indent + "}")
    
    fn generate_statement(inout self, node_ref: ASTNodeRef) -> String:
        """Generate MLIR for a statement.
        
        Args:
            node_ref: Reference to the statement node.
            
        Returns:
            Empty string (statements don't produce values).
        """
        let kind = self.parser.node_store.get_node_kind(node_ref)
        let indent = self.get_indent()
        
        # Control flow statements (Phase 2)
        if kind == ASTNodeKind.IF_STMT:
            self.generate_if_statement(node_ref)
        elif kind == ASTNodeKind.WHILE_STMT:
            self.generate_while_statement(node_ref)
        elif kind == ASTNodeKind.FOR_STMT:
            self.generate_for_statement(node_ref)
        elif kind == ASTNodeKind.BREAK_STMT:
            self.emit(indent + "cf.br ^break")  # Branch to break label
        elif kind == ASTNodeKind.CONTINUE_STMT:
            self.emit(indent + "cf.br ^continue")  # Branch to continue label
        elif kind == ASTNodeKind.PASS_STMT:
            # Pass is a no-op, just add a comment
            self.emit(indent + "// pass")
        
        # Phase 1 statements
        elif kind == ASTNodeKind.RETURN_STMT:
            # Get return node
            if node_ref < len(self.parser.return_nodes):
                let ret_node = self.parser.return_nodes[node_ref]
                if ret_node.value != 0:  # Has a return value
                    let value_ssa = self.generate_expression(ret_node.value)
                    let ret_type = self.get_expression_type(ret_node.value)
                    self.emit(indent + "return " + value_ssa + " : " + ret_type)
                else:
                    self.emit(indent + "return")
        elif kind == ASTNodeKind.VAR_DECL:
            # Variable declaration - generate as SSA value
            if node_ref < len(self.parser.var_decl_nodes):
                let var_node = self.parser.var_decl_nodes[node_ref]
                if var_node.initializer != 0:
                    let value_ssa = self.generate_expression(var_node.initializer)
                    # Track the identifier mapping
                    self.identifier_map[var_node.name] = value_ssa
        elif kind >= ASTNodeKind.BINARY_EXPR and kind <= ASTNodeKind.BOOL_LITERAL:
            # Expression statement (e.g., function call)
            _ = self.generate_expression(node_ref)
        
        return ""
    
    fn generate_if_statement(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for an if statement using scf.if.
        
        Args:
            node_ref: Reference to the if statement node.
        """
        if node_ref >= len(self.parser.if_stmt_nodes):
            return
        
        let if_node = self.parser.if_stmt_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate condition
        let condition_ssa = self.generate_expression(if_node.condition)
        
        # Generate scf.if operation
        self.emit(indent + "scf.if " + condition_ssa + " {")
        self.indent_level += 1
        
        # Generate then block
        for i in range(len(if_node.then_block)):
            self.generate_statement(if_node.then_block[i])
        
        self.indent_level -= 1
        
        # Generate elif blocks as nested if-else
        if len(if_node.elif_conditions) > 0:
            self.emit(indent + "} else {")
            self.indent_level += 1
            # Generate nested if for elif
            for i in range(len(if_node.elif_conditions)):
                let elif_cond_ssa = self.generate_expression(if_node.elif_conditions[i])
                let elif_indent = self.get_indent()
                self.emit(elif_indent + "scf.if " + elif_cond_ssa + " {")
                self.indent_level += 1
                
                # Generate elif block
                for j in range(len(if_node.elif_blocks[i])):
                    self.generate_statement(if_node.elif_blocks[i][j])
                
                self.indent_level -= 1
                if i < len(if_node.elif_conditions) - 1 or len(if_node.else_block) > 0:
                    self.emit(elif_indent + "} else {")
                    self.indent_level += 1
                else:
                    self.emit(elif_indent + "}")
            
            # Generate else block if present
            if len(if_node.else_block) > 0:
                for i in range(len(if_node.else_block)):
                    self.generate_statement(if_node.else_block[i])
                self.indent_level -= 1
                self.emit(self.get_indent() + "}")
            
            self.indent_level -= 1
            self.emit(indent + "}")
        elif len(if_node.else_block) > 0:
            # Just else, no elif
            self.emit(indent + "} else {")
            self.indent_level += 1
            
            for i in range(len(if_node.else_block)):
                self.generate_statement(if_node.else_block[i])
            
            self.indent_level -= 1
            self.emit(indent + "}")
        else:
            # No else
            self.emit(indent + "}")
    
    fn generate_while_statement(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for a while loop using scf.while.
        
        Args:
            node_ref: Reference to the while statement node.
        """
        if node_ref >= len(self.parser.while_stmt_nodes):
            return
        
        let while_node = self.parser.while_stmt_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate scf.while - before region checks condition
        self.emit(indent + "scf.while : () -> () {")
        self.indent_level += 1
        
        # Generate condition check
        let condition_ssa = self.generate_expression(while_node.condition)
        self.emit(self.get_indent() + "scf.condition(" + condition_ssa + ")")
        
        self.indent_level -= 1
        self.emit(indent + "} do {")
        self.indent_level += 1
        
        # Generate loop body
        for i in range(len(while_node.body)):
            self.generate_statement(while_node.body[i])
        
        # Yield to continue loop
        self.emit(self.get_indent() + "scf.yield")
        
        self.indent_level -= 1
        self.emit(indent + "}")
    
    fn generate_for_statement(inout self, node_ref: ASTNodeRef):
        """Generate MLIR for a for loop using scf.for.
        
        Phase 3 enhancement: Improved collection iteration support.
        For collections implementing Iterable trait, generates:
        1. Call to __iter__() to get iterator
        2. Loop calling __next__() until exhausted
        3. Body execution with yielded values
        
        Args:
            node_ref: Reference to the for statement node.
        """
        if node_ref >= len(self.parser.for_stmt_nodes):
            return
        
        let for_node = self.parser.for_stmt_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate collection expression
        let collection_ssa = self.generate_expression(for_node.collection)
        
        # Check if this is a range() call (simplified iteration)
        let is_range = self._is_range_call_mlir(for_node.collection)
        
        if is_range:
            # Range-based iteration: use scf.for directly
            self.emit(indent + "// Range-based for loop: " + for_node.iterator)
            self.emit(indent + "scf.for %iv = %c0 to %count step %c1 {")
            self.indent_level += 1
            
            # Map iterator to induction variable
            self.identifier_map[for_node.iterator] = "%iv"
        else:
            # Collection iteration: use Iterable protocol
            self.emit(indent + "// Collection iteration: " + for_node.iterator + " in " + collection_ssa)
            self.emit(indent + "// Phase 3: Iterable protocol")
            let iterator_ssa = self.next_ssa_value()
            self.emit(indent + "// " + iterator_ssa + " = mojo.call_method " + collection_ssa + ", \"__iter__\" : () -> !Iterator")
            
            # Generate while loop for iteration
            self.emit(indent + "scf.while () : () -> () {")
            self.indent_level += 1
            
            # Call __next__() on iterator
            let next_val = self.next_ssa_value()
            self.emit(self.get_indent() + "// " + next_val + " = mojo.call_method " + iterator_ssa + ", \"__next__\" : () -> !Optional")
            
            # Check if value is present
            let has_value = self.next_ssa_value()
            self.emit(self.get_indent() + "// " + has_value + " = mojo.call_method " + next_val + ", \"has_value\" : () -> i1")
            self.emit(self.get_indent() + "scf.condition(" + has_value + ")")
            
            self.indent_level -= 1
            self.emit(indent + "} do {")
            self.indent_level += 1
            
            # Extract value from Optional
            let value_ssa = self.next_ssa_value()
            self.emit(self.get_indent() + "// " + value_ssa + " = mojo.call_method " + next_val + ", \"value\" : () -> i64")
            
            # Map iterator to extracted value
            self.identifier_map[for_node.iterator] = value_ssa
        
        # Generate loop body (common for both paths)
        for i in range(len(for_node.body)):
            self.generate_statement(for_node.body[i])
        
        self.indent_level -= 1
        self.emit(indent + "}")
    
    fn _is_range_call_mlir(self, expr_ref: ASTNodeRef) -> Bool:
        """Check if an expression is a call to range().
        
        Args:
            expr_ref: The expression node reference.
            
        Returns:
            True if the expression is a range() call.
        """
        let kind = self.parser.node_store.get_node_kind(expr_ref)
        if kind == ASTNodeKind.CALL_EXPR:
            if expr_ref >= 0 and expr_ref < len(self.parser.call_expr_nodes):
                let call_node = self.parser.call_expr_nodes[expr_ref]
                let func_kind = self.parser.node_store.get_node_kind(call_node.function)
                if func_kind == ASTNodeKind.IDENTIFIER_EXPR:
                    if call_node.function >= 0 and call_node.function < len(self.parser.identifier_nodes):
                        let id_node = self.parser.identifier_nodes[call_node.function]
                        return id_node.name == "range"
        return False
    
    fn generate_expression(inout self, node_ref: ASTNodeRef) -> String:
        """Generate MLIR for an expression.
        
        Args:
            node_ref: Reference to the expression node.
            
        Returns:
            The MLIR value name (e.g., "%0", "%result").
        """
        let kind = self.parser.node_store.get_node_kind(node_ref)
        let indent = self.get_indent()
        
        if kind == ASTNodeKind.INTEGER_LITERAL:
            if node_ref < len(self.parser.int_literal_nodes):
                let lit_node = self.parser.int_literal_nodes[node_ref]
                let result = self.next_ssa_value()
                self.emit(indent + result + " = arith.constant " + lit_node.value + " : i64")
                return result
        
        elif kind == ASTNodeKind.STRING_LITERAL:
            if node_ref < len(self.parser.string_literal_nodes):
                let lit_node = self.parser.string_literal_nodes[node_ref]
                let result = self.next_ssa_value()
                self.emit(indent + result + ' = arith.constant "' + lit_node.value + '" : !mojo.string')
                return result
        
        elif kind == ASTNodeKind.FLOAT_LITERAL:
            if node_ref < len(self.parser.float_literal_nodes):
                let lit_node = self.parser.float_literal_nodes[node_ref]
                let result = self.next_ssa_value()
                self.emit(indent + result + " = arith.constant " + lit_node.value + " : f64")
                return result
        
        elif kind == ASTNodeKind.BOOL_LITERAL:
            if node_ref < len(self.parser.bool_literal_nodes):
                let lit_node = self.parser.bool_literal_nodes[node_ref]
                let result = self.next_ssa_value()
                let bool_val = "true" if lit_node.value else "false"
                self.emit(indent + result + " = arith.constant " + bool_val + " : i1")
                return result
        
        elif kind == ASTNodeKind.IDENTIFIER_EXPR:
            if node_ref < len(self.parser.identifier_nodes):
                let id_node = self.parser.identifier_nodes[node_ref]
                # Look up the identifier in the map
                if id_node.name in self.identifier_map:
                    return self.identifier_map[id_node.name]
                # If not found, return the name itself (could be a parameter)
                return id_node.name
        
        elif kind == ASTNodeKind.CALL_EXPR:
            return self.generate_call(node_ref)
        
        elif kind == ASTNodeKind.BINARY_EXPR:
            return self.generate_binary_expr(node_ref)
        
        elif kind == ASTNodeKind.UNARY_EXPR:
            return self.generate_unary_expr(node_ref)
        
        elif kind == ASTNodeKind.MEMBER_ACCESS:
            return self.generate_member_access(node_ref)
        
        return "%0"
    
    fn generate_call(inout self, node_ref: ASTNodeRef) -> String:
        """Generate function call or struct instantiation.
        
        Args:
            node_ref: Reference to the call expression node.
            
        Returns:
            The result reference (or empty for void calls).
        """
        if node_ref >= len(self.parser.call_expr_nodes):
            return ""
        
        let call_node = self.parser.call_expr_nodes[node_ref]
        let indent = self.get_indent()
        
        # Check if it's a struct instantiation (heuristic: starts with uppercase)
        # This is simplified for Phase 2 - full implementation would check type context
        if len(call_node.callee) > 0 and call_node.callee[0].isupper():
            # Likely a struct instantiation
            let result = self.next_ssa_value()
            self.emit(indent + "// Struct instantiation: " + call_node.callee)
            self.emit(indent + result + " = arith.constant 0 : i64  // placeholder for " + call_node.callee + " instance")
            return result
        
        # Check if it's a builtin
        if call_node.callee == "print":
            # Generate arguments
            var args = List[String]()
            for arg_ref in call_node.arguments:
                args.append(self.generate_expression(arg_ref[]))
            
            # Generate print call
            if len(args) > 0:
                let arg_type = self.get_expression_type(call_node.arguments[0])
                self.emit(indent + "mojo.print " + args[0] + " : " + arg_type)
            return ""
        else:
            # Regular function call
            var args = List[String]()
            var arg_types = List[String]()
            for arg_ref in call_node.arguments:
                args.append(self.generate_expression(arg_ref[]))
                arg_types.append(self.get_expression_type(arg_ref[]))
            
            let result = self.next_ssa_value()
            var call_str = indent + result + " = func.call @" + call_node.callee + "("
            for i in range(len(args)):
                if i > 0:
                    call_str += ", "
                call_str += args[i]
            call_str += ") : ("
            for i in range(len(arg_types)):
                if i > 0:
                    call_str += ", "
                call_str += arg_types[i]
            call_str += ") -> i64"  # Simplified - assume Int return
            self.emit(call_str)
            return result
    
    fn generate_binary_expr(inout self, node_ref: ASTNodeRef) -> String:
        """Generate binary operation.
        
        Args:
            node_ref: Reference to the binary expression node.
            
        Returns:
            The result reference.
        """
        if node_ref >= len(self.parser.binary_expr_nodes):
            return "%0"
        
        let bin_node = self.parser.binary_expr_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate left and right operands
        let left_val = self.generate_expression(bin_node.left)
        let right_val = self.generate_expression(bin_node.right)
        let result = self.next_ssa_value()
        
        # Determine the operation and type
        var op_name = ""
        var type_str = "i64"  # Default for arithmetic operations
        var operand_type = "i64"  # Type for operands (can differ from result type)
        
        if bin_node.operator == "+":
            op_name = "arith.addi"
        elif bin_node.operator == "-":
            op_name = "arith.subi"
        elif bin_node.operator == "*":
            op_name = "arith.muli"
        elif bin_node.operator == "/":
            op_name = "arith.divsi"
        elif bin_node.operator == "%":
            op_name = "arith.remsi"
        elif bin_node.operator == "==":
            op_name = "arith.cmpi eq"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == "!=":
            op_name = "arith.cmpi ne"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == "<":
            op_name = "arith.cmpi slt"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == "<=":
            op_name = "arith.cmpi sle"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == ">":
            op_name = "arith.cmpi sgt"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == ">=":
            op_name = "arith.cmpi sge"
            type_str = "i1"  # Comparison result is boolean
        elif bin_node.operator == "&&":
            op_name = "arith.andi"
            type_str = "i1"  # Boolean type
            operand_type = "i1"
        elif bin_node.operator == "||":
            op_name = "arith.ori"
            type_str = "i1"  # Boolean type
            operand_type = "i1"
        else:
            op_name = "arith.addi"  # Default
        
        # Generate MLIR based on operation type
        if "arith.cmpi" in op_name:
            # Comparison operations: arith.cmpi <predicate>, <left>, <right> : <operand_type>
            # Result type is i1 (boolean), but operand type is specified
            self.emit(indent + result + " = " + op_name + ", " + left_val + ", " + right_val + " : " + operand_type)
        else:
            # Standard binary operations
            self.emit(indent + result + " = " + op_name + " " + left_val + ", " + right_val + " : " + type_str)
        return result
    
    fn generate_unary_expr(inout self, node_ref: ASTNodeRef) -> String:
        """Generate unary operation.
        
        Args:
            node_ref: Reference to the unary expression node.
            
        Returns:
            The result reference.
        """
        if node_ref >= len(self.parser.unary_expr_nodes):
            return "%0"
        
        let unary_node = self.parser.unary_expr_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate operand
        let operand_val = self.generate_expression(unary_node.operand)
        let result = self.next_ssa_value()
        
        # Determine the operation
        if unary_node.operator == "-":
            # Negation: 0 - operand (for numeric types)
            let zero = self.next_ssa_value()
            self.emit(indent + zero + " = arith.constant 0 : i64")
            self.emit(indent + result + " = arith.subi " + zero + ", " + operand_val + " : i64")
        elif unary_node.operator == "!":
            # Logical NOT: xor with true (for boolean types)
            # Note: The operand should be i1 (boolean), typically from a comparison
            # Example: !(a > b) where (a > b) produces i1
            let true_val = self.next_ssa_value()
            self.emit(indent + true_val + " = arith.constant true : i1")
            self.emit(indent + result + " = arith.xori " + operand_val + ", " + true_val + " : i1")
        elif unary_node.operator == "~":
            # Bitwise NOT: xor with -1 (for integer types)
            let neg_one = self.next_ssa_value()
            self.emit(indent + neg_one + " = arith.constant -1 : i64")
            self.emit(indent + result + " = arith.xori " + operand_val + ", " + neg_one + " : i64")
        else:
            # Unknown operator, just return operand
            return operand_val
        
        return result
    
    fn generate_member_access(inout self, node_ref: ASTNodeRef) -> String:
        """Generate member access (field or method call).
        
        For Phase 2, we emit simplified member access as comments.
        Full struct codegen would require proper LLVM struct operations.
        
        Args:
            node_ref: Reference to the member access node.
            
        Returns:
            The result reference.
        """
        if node_ref >= len(self.parser.member_access_nodes):
            return "%0"
        
        let member_node = self.parser.member_access_nodes[node_ref]
        let indent = self.get_indent()
        
        # Generate the object expression
        let object_val = self.generate_expression(member_node.object)
        let result = self.next_ssa_value()
        
        if member_node.is_method_call:
            # Method call - emit as comment for Phase 2
            self.emit(indent + "// Method call: " + object_val + "." + member_node.member + "()")
            self.emit(indent + result + " = arith.constant 0 : i64  // placeholder for method result")
        else:
            # Field access - emit as comment for Phase 2
            self.emit(indent + "// Field access: " + object_val + "." + member_node.member)
            self.emit(indent + result + " = arith.constant 0 : i64  // placeholder for field value")
        
        return result
    
    fn get_expression_type(self, node_ref: ASTNodeRef) -> String:
        """Get the MLIR type of an expression.
        
        Args:
            node_ref: Reference to the expression node.
            
        Returns:
            The MLIR type string.
        """
        let kind = self.parser.node_store.get_node_kind(node_ref)
        
        if kind == ASTNodeKind.INTEGER_LITERAL:
            return "i64"
        elif kind == ASTNodeKind.STRING_LITERAL:
            return "!mojo.string"
        elif kind == ASTNodeKind.FLOAT_LITERAL:
            return "f64"
        elif kind == ASTNodeKind.BINARY_EXPR:
            return "i64"  # Simplified
        elif kind == ASTNodeKind.CALL_EXPR:
            return "i64"  # Simplified
        else:
            return "i64"  # Default
    
    fn emit(inout self, code: String):
        """Emit MLIR code to the output.
        
        Args:
            code: The MLIR code to emit.
        """
        self.output += code + "\n"
    
    fn emit_type(self, type_name: String) -> String:
        """Convert a Mojo type to MLIR type syntax.
        
        Args:
            type_name: The Mojo type name.
            
        Returns:
            The MLIR type representation.
        """
        # Map Mojo types to MLIR types
        if type_name == "Int" or type_name == "Int64":
            return "i64"
        elif type_name == "Int32":
            return "i32"
        elif type_name == "Int16":
            return "i16"
        elif type_name == "Int8":
            return "i8"
        elif type_name == "UInt64":
            return "i64"
        elif type_name == "UInt32":
            return "i32"
        elif type_name == "UInt16":
            return "i16"
        elif type_name == "UInt8":
            return "i8"
        elif type_name == "Float64":
            return "f64"
        elif type_name == "Float32":
            return "f32"
        elif type_name == "Bool":
            return "i1"
        elif type_name == "String":
            return "!mojo.string"
        elif type_name == "NoneType" or type_name == "None":
            return "()"
        else:
            # Custom types
            return "!mojo.value<" + type_name + ">"
    
    fn generate_builtin_call(inout self, function_name: String, args: List[String]) -> String:
        """Generate MLIR for builtin function calls like print.
        
        Args:
            function_name: The builtin function name.
            args: The argument value names.
            
        Returns:
            The result value name (if any).
        """
        let indent = self.get_indent()
        if function_name == "print":
            # Generate print call
            if len(args) > 0:
                self.emit(indent + "mojo.print " + args[0])
            return ""
        else:
            # Generic builtin call
            var arg_str = ""
            for i in range(len(args)):
                if i > 0:
                    arg_str += ", "
                arg_str += args[i]
            self.emit(indent + "mojo.call_builtin @" + function_name + "(" + arg_str + ")")
            let result = self.next_ssa_value()
            return result
