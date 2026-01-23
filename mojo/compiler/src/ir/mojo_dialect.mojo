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

"""Mojo dialect definition for MLIR.

This module defines the Mojo-specific MLIR dialect that represents
Mojo language semantics.

Operations include:
- mojo.func: Function definition
- mojo.call: Function call
- mojo.return: Return statement
- mojo.print: Print builtin operation
- mojo.const: Constant value
- mojo.struct: Struct type definition
- mojo.trait: Trait definition
- mojo.own: Ownership operation
- mojo.borrow: Borrow operation
- mojo.mut_borrow: Mutable borrow operation
- mojo.move: Move operation
- mojo.copy: Copy operation
- mojo.parametric_call: Parametric function call
- mojo.trait_call: Trait method call

Types include:
- !mojo.string: String type
- !mojo.value<T>: Owned value type
- !mojo.ref<T>: Borrowed reference type
- !mojo.mut_ref<T>: Mutable borrowed reference type
- !mojo.struct<name, fields>: Struct type
- !mojo.trait<name>: Trait type
"""


struct MojoDialect:
    """Represents the Mojo MLIR dialect.
    
    This dialect extends MLIR with Mojo-specific operations and types.
    It bridges the gap between high-level Mojo semantics and lower-level
    MLIR/LLVM representations.
    """
    
    var name: String
    
    fn __init__(inout self):
        """Initialize the Mojo dialect."""
        self.name = "mojo"
    
    fn register_operations(inout self):
        """Register all Mojo dialect operations.
        
        This includes:
        - Memory operations (own, borrow, move, copy)
        - Function operations (func, call, return)
        - Builtin operations (print, etc.)
        - Struct operations
        - Trait operations
        """
        # In a real implementation, this would register operations with MLIR
        # For Phase 1, we just document what operations exist
        pass
    
    fn register_types(inout self):
        """Register all Mojo dialect types.
        
        This includes:
        - Value types (!mojo.value<T>, !mojo.string)
        - Reference types (!mojo.ref<T>, !mojo.mut_ref<T>)
        - Struct types (!mojo.struct<...>)
        - Trait types (!mojo.trait<...>)
        """
        # In a real implementation, this would register types with MLIR
        # For Phase 1, we just document what types exist
        pass
    
    fn get_operation_syntax(self, op_name: String) -> String:
        """Get the syntax for a Mojo dialect operation.
        
        Args:
            op_name: The operation name (e.g., "print", "call").
            
        Returns:
            A string describing the operation syntax.
        """
        if op_name == "print":
            return "mojo.print %value : type"
        elif op_name == "call":
            return "mojo.call @function(%args...) : (arg_types...) -> result_type"
        elif op_name == "return":
            return "mojo.return %value : type"
        elif op_name == "const":
            return "%result = mojo.const value : type"
        elif op_name == "own":
            return "%result = mojo.own %value : !mojo.value<T>"
        elif op_name == "borrow":
            return "%result = mojo.borrow %value : !mojo.ref<T>"
        elif op_name == "move":
            return "%result = mojo.move %value : !mojo.value<T>"
        elif op_name == "copy":
            return "%result = mojo.copy %value : !mojo.value<T>"
        else:
            return "Unknown operation: " + op_name


struct MojoOperation:
    """Base struct for Mojo MLIR operations.
    
    Represents a single operation in the Mojo dialect with its operands and results.
    """
    
    var name: String
    var operands: List[String]
    var results: List[String]
    var attributes: String  # Simplified - would be a proper dict in real impl
    
    fn __init__(inout self, name: String):
        """Initialize a Mojo operation.
        
        Args:
            name: The name of the operation (e.g., "mojo.print", "mojo.call").
        """
        self.name = name
        self.operands = List[String]()
        self.results = List[String]()
        self.attributes = ""
    
    fn add_operand(inout self, operand: String):
        """Add an operand to the operation.
        
        Args:
            operand: The operand SSA value name.
        """
        self.operands.append(operand)
    
    fn add_result(inout self, result: String):
        """Add a result to the operation.
        
        Args:
            result: The result SSA value name.
        """
        self.results.append(result)
    
    fn to_string(self) -> String:
        """Convert the operation to MLIR text.
        
        Returns:
            The MLIR representation of this operation.
        """
        var output = ""
        
        # Add results if any
        if len(self.results) > 0:
            for i in range(len(self.results)):
                if i > 0:
                    output += ", "
                output += self.results[i]
            output += " = "
        
        # Add operation name
        output += self.name
        
        # Add operands
        if len(self.operands) > 0:
            output += " "
            for i in range(len(self.operands)):
                if i > 0:
                    output += ", "
                output += self.operands[i]
        
        return output


struct MojoType:
    """Base struct for Mojo MLIR types.
    
    Represents a type in the Mojo dialect type system.
    """
    
    var name: String
    var params: List[String]  # Type parameters for generic types
    
    fn __init__(inout self, name: String):
        """Initialize a Mojo type.
        
        Args:
            name: The name of the type (e.g., "String", "Int", "List").
        """
        self.name = name
        self.params = List[String]()
    
    fn add_param(inout self, param: String):
        """Add a type parameter.
        
        Args:
            param: The type parameter name.
        """
        self.params.append(param)
    
    fn to_mlir_string(self) -> String:
        """Convert the type to MLIR type syntax.
        
        Returns:
            The MLIR type representation (e.g., "!mojo.string", "!mojo.value<Int>").
        """
        if self.name == "String":
            return "!mojo.string"
        elif self.name == "Int":
            return "i64"
        elif self.name == "Float64":
            return "f64"
        elif self.name == "Bool":
            return "i1"
        elif len(self.params) > 0:
            # Generic type
            var output = "!mojo.value<" + self.name
            for param in self.params:
                output += ", " + param[]
            output += ">"
            return output
        else:
            # Custom type
            return "!mojo.value<" + self.name + ">"

