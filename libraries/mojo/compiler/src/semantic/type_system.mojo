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

"""Type system for the Mojo compiler.

This module defines the type system including:
- Builtin types (Int, Float, Bool, String, etc.)
- User-defined types (structs)
- Parametric types and generics
- Trait types
- Reference types
"""

from collections import Dict, Optional, List


struct FieldInfo:
    """Information about a struct field."""
    
    var name: String
    var field_type: Type
    
    fn __init__(inout self, name: String, field_type: Type):
        """Initialize field info.
        
        Args:
            name: The field name.
            field_type: The field type.
        """
        self.name = name
        self.field_type = field_type


struct MethodInfo:
    """Information about a struct method."""
    
    var name: String
    var parameter_types: List[Type]
    var return_type: Type
    
    fn __init__(inout self, name: String, return_type: Type):
        """Initialize method info.
        
        Args:
            name: The method name.
            return_type: The method return type.
        """
        self.name = name
        self.parameter_types = List[Type]()
        self.return_type = return_type


struct TraitInfo:
    """Information about a trait type.
    
    Traits define interfaces that structs must implement.
    They contain method signatures without implementations.
    """
    
    var name: String
    var required_methods: List[MethodInfo]
    
    fn __init__(inout self, name: String):
        """Initialize trait info.
        
        Args:
            name: The trait name.
        """
        self.name = name
        self.required_methods = List[MethodInfo]()
    
    fn add_required_method(inout self, name: String, return_type: Type):
        """Add a required method signature to the trait.
        
        Args:
            name: The method name.
            return_type: The method return type.
        """
        self.required_methods.append(MethodInfo(name, return_type))
    
    fn has_method(self, method_name: String) -> Bool:
        """Check if the trait requires a method.
        
        Args:
            method_name: The method name.
            
        Returns:
            True if the method is required by this trait.
        """
        for i in range(len(self.required_methods)):
            if self.required_methods[i].name == method_name:
                return True
        return False
    
    fn get_method(self, method_name: String) -> MethodInfo:
        """Get required method info by name.
        
        Args:
            method_name: The method name.
            
        Returns:
            The method info, or a dummy method if not found.
        """
        for i in range(len(self.required_methods)):
            if self.required_methods[i].name == method_name:
                return self.required_methods[i]
        return MethodInfo("unknown", Type("Unknown"))


struct StructInfo:
    """Information about a struct type."""
    
    var name: String
    var fields: List[FieldInfo]
    var methods: List[MethodInfo]
    var implemented_traits: List[String]  # Names of traits this struct implements
    
    fn __init__(inout self, name: String):
        """Initialize struct info.
        
        Args:
            name: The struct name.
        """
        self.name = name
        self.fields = List[FieldInfo]()
        self.methods = List[MethodInfo]()
        self.implemented_traits = List[String]()
    
    fn add_field(inout self, name: String, field_type: Type):
        """Add a field to the struct.
        
        Args:
            name: The field name.
            field_type: The field type.
        """
        self.fields.append(FieldInfo(name, field_type))
    
    fn add_method(inout self, name: String, return_type: Type):
        """Add a method to the struct.
        
        Args:
            name: The method name.
            return_type: The method return type.
        """
        self.methods.append(MethodInfo(name, return_type))
    
    fn add_trait(inout self, trait_name: String):
        """Mark this struct as implementing a trait.
        
        Args:
            trait_name: The name of the trait.
        """
        self.implemented_traits.append(trait_name)
    
    fn get_field_type(self, field_name: String) -> Type:
        """Get the type of a field by name.
        
        Args:
            field_name: The name of the field.
            
        Returns:
            The field type, or Unknown if not found.
        """
        for i in range(len(self.fields)):
            if self.fields[i].name == field_name:
                return self.fields[i].field_type
        return Type("Unknown")
    
    fn has_method(self, method_name: String) -> Bool:
        """Check if the struct has a method.
        
        Args:
            method_name: The method name.
            
        Returns:
            True if the method exists.
        """
        for i in range(len(self.methods)):
            if self.methods[i].name == method_name:
                return True
        return False
    
    fn get_method(self, method_name: String) -> MethodInfo:
        """Get method info by name.
        
        Args:
            method_name: The method name.
            
        Returns:
            The method info, or a dummy method if not found.
        """
        for i in range(len(self.methods)):
            if self.methods[i].name == method_name:
                return self.methods[i]
        return MethodInfo("unknown", Type("Unknown"))


struct Type:
    """Represents a type in the Mojo type system.
    
    Types can be:
    - Builtin types (Int, Float64, Bool, String)
    - User-defined types (struct definitions)
    - Parametric types (List[T], Dict[K, V])
    - Trait types
    - Reference types (owned, borrowed, mutable)
    """
    
    var name: String
    var is_parametric: Bool
    var is_reference: Bool
    var is_mutable_reference: Bool  # &mut T
    var is_struct: Bool  # Track if this is a struct type
    var type_params: List[Type]  # Type parameters for generics
    
    fn __init__(inout self, name: String, is_parametric: Bool = False, is_reference: Bool = False, is_struct: Bool = False):
        """Initialize a type.
        
        Args:
            name: The name of the type.
            is_parametric: Whether this is a parametric type.
            is_reference: Whether this is a reference type.
            is_struct: Whether this is a struct type.
        """
        self.name = name
        self.is_parametric = is_parametric
        self.is_reference = is_reference
        self.is_mutable_reference = False
        self.is_struct = is_struct
        self.type_params = List[Type]()
    
    fn is_builtin(self) -> Bool:
        """Check if this is a builtin type.
        
        Returns:
            True if this is a builtin type.
        """
        let builtins = ["Int", "Float64", "Float32", "Bool", "String", "UInt8", "UInt16", "UInt32", "UInt64", "Int8", "Int16", "Int32", "Int64", "NoneType"]
        return self.name in builtins
    
    fn is_numeric(self) -> Bool:
        """Check if this is a numeric type.
        
        Returns:
            True if this is a numeric type.
        """
        let numeric = ["Int", "Float64", "Float32", "UInt8", "UInt16", "UInt32", "UInt64", "Int8", "Int16", "Int32", "Int64"]
        return self.name in numeric
    
    fn is_integer(self) -> Bool:
        """Check if this is an integer type.
        
        Returns:
            True if this is an integer type.
        """
        let integers = ["Int", "UInt8", "UInt16", "UInt32", "UInt64", "Int8", "Int16", "Int32", "Int64"]
        return self.name in integers
    
    fn is_float(self) -> Bool:
        """Check if this is a floating point type.
        
        Returns:
            True if this is a floating point type.
        """
        return self.name in ["Float32", "Float64"]
    
    fn is_compatible_with(self, other: Type) -> Bool:
        """Check if this type is compatible with another type.
        
        Args:
            other: The other type to check compatibility with.
            
        Returns:
            True if the types are compatible.
        """
        # Exact match
        if self.name == other.name:
            return True
        
        # Numeric type promotions
        if self.is_numeric() and other.is_numeric():
            # Allow implicit promotion from smaller to larger types
            if self.is_integer() and other.is_integer():
                return True  # Simplified: allow any integer promotion
            if self.is_integer() and other.is_float():
                return True  # Int to Float promotion
        
        # Unknown type is compatible with anything (for inference)
        if self.name == "Unknown" or other.name == "Unknown":
            return True
        
        return False
    
    fn is_generic(self) -> Bool:
        """Check if this is a generic type (has type parameters).
        
        Returns:
            True if this type has type parameters.
        """
        return self.is_parametric and len(self.type_params) > 0
    
    fn substitute_type_params(self, substitutions: Dict[String, Type]) -> Type:
        """Substitute type parameters with concrete types.
        
        This is used for monomorphization of generic types.
        For example, substituting T -> Int in List[T] produces List[Int].
        
        Args:
            substitutions: Map from type parameter names to concrete types.
            
        Returns:
            A new Type with type parameters substituted.
        """
        # If this is a type parameter itself, substitute it
        if self.name in substitutions:
            return substitutions[self.name]
        
        # If this is a parametric type, recursively substitute type parameters
        if self.is_parametric and len(self.type_params) > 0:
            var result = Type(self.name, is_parametric=True, is_reference=self.is_reference, is_struct=self.is_struct)
            result.is_mutable_reference = self.is_mutable_reference
            for i in range(len(self.type_params)):
                result.type_params.append(self.type_params[i].substitute_type_params(substitutions))
            return result
        
        # Otherwise, return self unchanged
        return self
    
    fn __eq__(self, other: Type) -> Bool:
        """Check equality with another type."""
        return self.name == other.name


struct TypeContext:
    """Context for type checking and type inference.
    
    Maintains information about:
    - Declared types
    - Type parameters
    - Trait implementations
    - Struct definitions
    """
    
    var types: Dict[String, Type]
    var structs: Dict[String, StructInfo]  # Store struct definitions
    var traits: Dict[String, TraitInfo]    # Store trait definitions
    
    fn __init__(inout self):
        """Initialize a type context with builtin types."""
        self.types = Dict[String, Type]()
        self.structs = Dict[String, StructInfo]()
        self.traits = Dict[String, TraitInfo]()
        # Register builtin types
        self.register_builtin_types()
    
    fn register_builtin_types(inout self):
        """Register all builtin types."""
        # Integer types
        self.types["Int"] = Type("Int")
        self.types["Int8"] = Type("Int8")
        self.types["Int16"] = Type("Int16")
        self.types["Int32"] = Type("Int32")
        self.types["Int64"] = Type("Int64")
        self.types["UInt8"] = Type("UInt8")
        self.types["UInt16"] = Type("UInt16")
        self.types["UInt32"] = Type("UInt32")
        self.types["UInt64"] = Type("UInt64")
        
        # Floating point types
        self.types["Float32"] = Type("Float32")
        self.types["Float64"] = Type("Float64")
        
        # Boolean and String
        self.types["Bool"] = Type("Bool")
        self.types["String"] = Type("String")
        self.types["StringLiteral"] = Type("StringLiteral")
        
        # Special types
        self.types["NoneType"] = Type("NoneType")
        self.types["Unknown"] = Type("Unknown")
        
        # Register builtin collection traits
        self._register_builtin_traits()
    
    fn _register_builtin_traits(inout self):
        """Register builtin traits like Iterable.
        
        These traits enable collection iteration and other standard protocols.
        """
        # Iterable trait - enables for loop iteration
        var iterable_trait = TraitInfo("Iterable")
        iterable_trait.add_required_method("__iter__", Type("Iterator"))
        self.register_trait(iterable_trait)
        
        # Iterator trait - returned by __iter__
        var iterator_trait = TraitInfo("Iterator")
        iterator_trait.add_required_method("__next__", Type("Optional"))
        self.register_trait(iterator_trait)
    
    fn register_type(inout self, name: String, type: Type):
        """Register a user-defined type.
        
        Args:
            name: The name of the type.
            type: The type to register.
        """
        self.types[name] = type
    
    fn register_struct(inout self, struct_info: StructInfo):
        """Register a struct type.
        
        Args:
            struct_info: The struct information to register.
        """
        self.structs[struct_info.name] = struct_info
        # Also register as a type
        self.types[struct_info.name] = Type(struct_info.name, is_struct=True)
    
    fn lookup_struct(self, name: String) -> StructInfo:
        """Look up a struct by name.
        
        Args:
            name: The name of the struct.
            
        Returns:
            The struct info, or an empty struct if not found.
        """
        return self.structs.get(name, StructInfo("Unknown"))
    
    fn is_struct(self, name: String) -> Bool:
        """Check if a type is a struct.
        
        Args:
            name: The type name.
            
        Returns:
            True if the type is a struct.
        """
        return name in self.structs
    
    fn register_trait(inout self, trait_info: TraitInfo):
        """Register a trait type.
        
        Args:
            trait_info: The trait information to register.
        """
        self.traits[trait_info.name] = trait_info
        # Also register as a type for type checking
        self.types[trait_info.name] = Type(trait_info.name)
    
    fn lookup_trait(self, name: String) -> TraitInfo:
        """Look up a trait by name.
        
        Args:
            name: The name of the trait.
            
        Returns:
            The trait info, or an empty trait if not found.
        """
        return self.traits.get(name, TraitInfo("Unknown"))
    
    fn is_trait(self, name: String) -> Bool:
        """Check if a type is a trait.
        
        Args:
            name: The type name.
            
        Returns:
            True if the type is a trait.
        """
        return name in self.traits
    
    fn lookup_type(self, name: String) -> Type:
        """Look up a type by name.
        
        Args:
            name: The name of the type.
            
        Returns:
            The type, or raises an error if not found.
        """
        # TODO: Implement type lookup with error handling
        return self.types.get(name, Type("Unknown"))
    
    fn check_trait_conformance(self, struct_name: String, trait_name: String) -> Bool:
        """Check if a struct conforms to a trait.
        
        Conformance requires the struct to implement all required methods
        of the trait with matching signatures.
        
        Args:
            struct_name: The name of the struct to check.
            trait_name: The name of the trait.
            
        Returns:
            True if the struct conforms to the trait.
        """
        # Look up struct and trait
        if not self.is_struct(struct_name) or not self.is_trait(trait_name):
            return False
        
        let struct_info = self.lookup_struct(struct_name)
        let trait_info = self.lookup_trait(trait_name)
        
        # Check that struct implements all required methods
        for i in range(len(trait_info.required_methods)):
            let required_method = trait_info.required_methods[i]
            
            # Check if struct has this method
            if not struct_info.has_method(required_method.name):
                return False
            
            # Check if method signatures match (return type compatibility)
            let struct_method = struct_info.get_method(required_method.name)
            if not struct_method.return_type.is_compatible_with(required_method.return_type):
                return False
        
        return True


struct TypeInferenceContext:
    """Context for type inference.
    
    Used to infer types from expressions and initializers.
    Phase 4 feature.
    """
    
    var inferred_types: Dict[String, Type]  # Variable name -> inferred type
    
    fn __init__(inout self):
        """Initialize type inference context."""
        self.inferred_types = Dict[String, Type]()
    
    fn infer_from_literal(self, literal_value: String, literal_kind: String) -> Type:
        """Infer type from a literal value.
        
        Args:
            literal_value: The literal value as a string.
            literal_kind: The kind of literal ("int", "float", "string", "bool").
            
        Returns:
            The inferred type.
        """
        if literal_kind == "int":
            return Type("Int")
        elif literal_kind == "float":
            return Type("Float64")
        elif literal_kind == "string":
            return Type("String")
        elif literal_kind == "bool":
            return Type("Bool")
        else:
            return Type("Unknown")
    
    fn infer_from_binary_expr(self, left_type: Type, right_type: Type, operator: String) -> Type:
        """Infer type from a binary expression.
        
        Args:
            left_type: Type of the left operand.
            right_type: Type of the right operand.
            operator: The binary operator.
            
        Returns:
            The inferred result type.
        """
        # Comparison operators return Bool
        if operator in ["==", "!=", "<", ">", "<=", ">=", "&&", "||"]:
            return Type("Bool")
        
        # Arithmetic operators return the operand type
        # TODO: Proper type promotion rules
        if left_type.is_numeric():
            return left_type
        if right_type.is_numeric():
            return right_type
        
        return Type("Unknown")


struct BorrowChecker:
    """Borrow checker for ownership and lifetime tracking.
    
    Phase 4 feature - ensures safe borrowing of references.
    Simplified implementation.
    """
    
    var borrowed_vars: List[String]  # Variables currently borrowed
    var mutably_borrowed_vars: List[String]  # Variables mutably borrowed
    
    fn __init__(inout self):
        """Initialize borrow checker."""
        self.borrowed_vars = List[String]()
        self.mutably_borrowed_vars = List[String]()
    
    fn can_borrow(self, var_name: String) -> Bool:
        """Check if a variable can be borrowed immutably.
        
        Args:
            var_name: The variable name.
            
        Returns:
            True if the variable can be borrowed.
        """
        # Can't borrow if already mutably borrowed
        for i in range(len(self.mutably_borrowed_vars)):
            if self.mutably_borrowed_vars[i] == var_name:
                return False
        return True
    
    fn can_borrow_mut(self, var_name: String) -> Bool:
        """Check if a variable can be borrowed mutably.
        
        Args:
            var_name: The variable name.
            
        Returns:
            True if the variable can be borrowed mutably.
        """
        # Can't mutably borrow if already borrowed (immutably or mutably)
        for i in range(len(self.borrowed_vars)):
            if self.borrowed_vars[i] == var_name:
                return False
        for i in range(len(self.mutably_borrowed_vars)):
            if self.mutably_borrowed_vars[i] == var_name:
                return False
        return True
    
    fn borrow(inout self, var_name: String):
        """Record an immutable borrow.
        
        Args:
            var_name: The variable being borrowed.
        """
        self.borrowed_vars.append(var_name)
    
    fn borrow_mut(inout self, var_name: String):
        """Record a mutable borrow.
        
        Args:
            var_name: The variable being mutably borrowed.
        """
        self.mutably_borrowed_vars.append(var_name)
    
    fn release_borrow(inout self, var_name: String):
        """Release an immutable borrow.
        
        Args:
            var_name: The variable being released.
        """
        # Simple implementation - in practice would need better tracking
        # This is a stub for Phase 4
        pass
    
    fn release_borrow_mut(inout self, var_name: String):
        """Release a mutable borrow.
        
        Args:
            var_name: The variable being released.
        """
        # Stub for Phase 4
        pass

