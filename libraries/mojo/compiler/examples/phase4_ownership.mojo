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

"""Example: Reference Types and Borrowing (Phase 4 Feature).

This example demonstrates:
- Immutable references (&T)
- Mutable references (&mut T)
- Borrow checking
- Ownership conventions (borrowed, inout, owned)
"""


fn read_value(borrowed x: Int) -> Int:
    """Read a value by borrowing it immutably.
    
    Args:
        x: The value to read (borrowed immutably).
        
    Returns:
        The value.
    """
    return x


fn increment(inout x: Int):
    """Increment a value by borrowing it mutably.
    
    Args:
        x: The value to increment (borrowed mutably).
    """
    x = x + 1


fn take_ownership(owned x: String):
    """Take ownership of a value.
    
    Args:
        x: The value to take ownership of.
    """
    print("Took ownership of:", x)
    # x is consumed here


fn use_reference(x: &Int) -> Int:
    """Use an immutable reference.
    
    Args:
        x: Reference to an Int.
        
    Returns:
        The value.
    """
    return x


fn modify_reference(x: &mut Int):
    """Modify through a mutable reference.
    
    Args:
        x: Mutable reference to an Int.
    """
    x = x + 10


fn demonstrate_borrowing():
    """Demonstrate borrow rules."""
    var x = 100
    
    # Multiple immutable borrows are allowed
    let ref1 = &x
    let ref2 = &x
    print("Refs:", ref1, ref2)
    
    # Mutable borrow (exclusive access)
    var mut_ref = &mut x
    # Cannot use ref1, ref2, or x while mut_ref is active
    mut_ref = 200
    
    # After mut_ref goes out of scope, x can be used again
    print("Value after mutation:", x)


fn main():
    """Demonstrate reference types and ownership."""
    
    # Borrowed parameter
    var value = 42
    let result = read_value(value)
    print("Read value:", result)
    print("Original still accessible:", value)
    
    # Inout parameter (mutable borrow)
    increment(value)
    print("After increment:", value)
    
    # Multiple increments
    increment(value)
    increment(value)
    print("After more increments:", value)
    
    # Owned parameter
    var message = "Hello"
    take_ownership(message)
    # message is no longer accessible here
    
    # Reference types
    var num = 50
    let read_result = use_reference(&num)
    print("Read via reference:", read_result)
    
    modify_reference(&mut num)
    print("After modification:", num)
    
    # Demonstrate borrowing rules
    demonstrate_borrowing()
    
    # Borrow checker prevents:
    # 1. Using a value while it's mutably borrowed
    # 2. Multiple mutable borrows at once
    # 3. Mutable borrow while immutably borrowed
    
    print("All borrow checks passed!")
