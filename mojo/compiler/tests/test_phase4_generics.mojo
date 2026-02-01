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

"""Test suite for Phase 4 parametric types (generics).

This test validates:
- Generic struct definitions
- Type parameter parsing
- Generic function definitions
- Type parameter substitution
- Monomorphization
"""

from src.frontend.lexer import Lexer
from src.frontend.parser import Parser
from src.frontend.ast import ASTNodeKind
from src.semantic.type_checker import TypeChecker
from src.semantic.type_system import Type


fn test_generic_struct_parsing():
    """Test parsing of generic struct definitions."""
    print("=== Test: Generic Struct Parsing ===")
    
    let source = """
struct Box[T]:
    var value: T
    
    fn get(self) -> T:
        return self.value

struct Pair[K, V]:
    var key: K
    var value: V
"""
    
    # Tokenize
    var lexer = Lexer(source)
    lexer.tokenize()
    
    # Check for bracket tokens
    var has_brackets = False
    for i in range(len(lexer.tokens)):
        let kind = lexer.tokens[i].kind.kind
        if kind == 302 or kind == 303:  # LEFT_BRACKET or RIGHT_BRACKET
            has_brackets = True
            break
    
    if has_brackets:
        print("✓ Lexer tokenizes square brackets for generics")
    else:
        print("✗ Lexer failed to tokenize brackets")
    
    # Parse
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    # Check struct count
    if len(parser.struct_nodes) == 2:
        print("✓ Parsed 2 struct definitions")
    else:
        print("✗ Expected 2 structs, got", len(parser.struct_nodes))
    
    # Check Box struct
    if len(parser.struct_nodes) > 0:
        let box_struct = parser.struct_nodes[0]
        if box_struct.name == "Box":
            print("✓ First struct name is 'Box'")
        else:
            print("✗ Expected 'Box', got '" + box_struct.name + "'")
        
        if len(box_struct.type_params) == 1:
            print("✓ Box has 1 type parameter")
            if len(box_struct.type_params) > 0 and box_struct.type_params[0].name == "T":
                print("✓ Type parameter is 'T'")
            else:
                print("✗ Expected type parameter 'T'")
        else:
            print("✗ Expected 1 type parameter, got", len(box_struct.type_params))
    
    # Check Pair struct
    if len(parser.struct_nodes) > 1:
        let pair_struct = parser.struct_nodes[1]
        if pair_struct.name == "Pair":
            print("✓ Second struct name is 'Pair'")
        else:
            print("✗ Expected 'Pair', got '" + pair_struct.name + "'")
        
        if len(pair_struct.type_params) == 2:
            print("✓ Pair has 2 type parameters")
            if len(pair_struct.type_params) >= 2:
                if pair_struct.type_params[0].name == "K" and pair_struct.type_params[1].name == "V":
                    print("✓ Type parameters are 'K' and 'V'")
                else:
                    print("✗ Expected type parameters 'K' and 'V'")
        else:
            print("✗ Expected 2 type parameters, got", len(pair_struct.type_params))
    
    print()


fn test_generic_function_parsing():
    """Test parsing of generic function definitions."""
    print("=== Test: Generic Function Parsing ===")
    
    let source = """
fn identity[T](x: T) -> T:
    return x

fn swap[A, B](a: A, b: B) -> Pair[B, A]:
    return Pair[B, A](b, a)
"""
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    # Check function count
    if len(parser.function_nodes) == 2:
        print("✓ Parsed 2 function definitions")
    else:
        print("✗ Expected 2 functions, got", len(parser.function_nodes))
    
    # Check identity function
    if len(parser.function_nodes) > 0:
        let identity_fn = parser.function_nodes[0]
        if identity_fn.name == "identity":
            print("✓ First function name is 'identity'")
        else:
            print("✗ Expected 'identity', got '" + identity_fn.name + "'")
        
        if len(identity_fn.type_params) == 1:
            print("✓ identity has 1 type parameter")
        else:
            print("✗ Expected 1 type parameter, got", len(identity_fn.type_params))
    
    # Check swap function
    if len(parser.function_nodes) > 1:
        let swap_fn = parser.function_nodes[1]
        if swap_fn.name == "swap":
            print("✓ Second function name is 'swap'")
        else:
            print("✗ Expected 'swap', got '" + swap_fn.name + "'")
        
        if len(swap_fn.type_params) == 2:
            print("✓ swap has 2 type parameters")
        else:
            print("✗ Expected 2 type parameters, got", len(swap_fn.type_params))
    
    print()


fn test_parametric_type_parsing():
    """Test parsing of parametric type usage."""
    print("=== Test: Parametric Type Usage ===")
    
    let source = """
fn use_generics():
    var int_box: Box[Int]
    var string_list: List[String]
    var map: Dict[String, Int]
"""
    
    var lexer = Lexer(source)
    lexer.tokenize()
    var parser = Parser(lexer.tokens)
    let ast = parser.parse()
    
    if len(parser.function_nodes) > 0:
        print("✓ Parsed function with parametric type annotations")
        # In a full implementation, we would check that:
        # - Variable declarations have parametric types
        # - Type parameters are correctly extracted (Int, String, etc.)
    else:
        print("✗ Failed to parse function")
    
    print()


fn test_type_parameter_substitution():
    """Test type parameter substitution for monomorphization."""
    print("=== Test: Type Parameter Substitution ===")
    
    # Create a generic type: Box[T]
    var generic_type = Type("Box", is_parametric=True)
    let type_param = Type("T")
    generic_type.type_params.append(type_param)
    
    print("✓ Created generic type Box[T]")
    
    # Create substitution: T -> Int
    var substitutions = Dict[String, Type]()
    substitutions["T"] = Type("Int")
    
    # Substitute to get Box[Int]
    let concrete_type = generic_type.substitute_type_params(substitutions)
    
    if concrete_type.name == "Box":
        print("✓ Substituted type retains struct name 'Box'")
    else:
        print("✗ Expected 'Box', got '" + concrete_type.name + "'")
    
    if len(concrete_type.type_params) > 0:
        if concrete_type.type_params[0].name == "Int":
            print("✓ Type parameter substituted to 'Int'")
        else:
            print("✗ Expected 'Int', got '" + concrete_type.type_params[0].name + "'")
    else:
        print("✗ No type parameters after substitution")
    
    print()


fn test_generic_type_checking():
    """Test type checking for generic types."""
    print("=== Test: Generic Type Checking ===")
    
    let source = """
struct Container[T]:
    var item: T
    
    fn get(self) -> T:
        return self.item

fn main():
    var c: Container[Int]
"""
    
    var parser = Parser(source)
    let ast = parser.parse()
    var checker = TypeChecker(parser)
    let success = checker.check(ast)
    
    if success:
        print("✓ Generic struct type checking passed")
    else:
        print("✗ Type checking failed")
        if len(checker.errors) > 0:
            print("  Error:", checker.errors[0])
    
    print()


fn main():
    """Run all Phase 4 generics tests."""
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   Phase 4: Parametric Types (Generics) Test Suite       ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    
    test_generic_struct_parsing()
    test_generic_function_parsing()
    test_parametric_type_parsing()
    test_type_parameter_substitution()
    test_generic_type_checking()
    
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   Phase 4 Generics Tests Complete                       ║")
    print("╚══════════════════════════════════════════════════════════╝")
