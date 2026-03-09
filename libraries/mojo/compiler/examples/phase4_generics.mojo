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

"""Example: Generic Box Type (Phase 4 Feature).

This example demonstrates:
- Generic struct definition
- Type parameters
- Generic methods
- Monomorphization (Box[Int], Box[String])
"""


struct Box[T]:
    """A generic container that holds a single value of type T."""
    
    var value: T
    
    fn __init__(inout self, value: T):
        """Initialize the box with a value.
        
        Args:
            value: The value to store in the box.
        """
        self.value = value
    
    fn get(self) -> T:
        """Get the value from the box.
        
        Returns:
            The stored value.
        """
        return self.value
    
    fn set(inout self, value: T):
        """Set a new value in the box.
        
        Args:
            value: The new value to store.
        """
        self.value = value
    
    fn map[U](self, f: fn(T) -> U) -> Box[U]:
        """Map a function over the box's value.
        
        Args:
            f: The function to apply.
            
        Returns:
            A new box with the transformed value.
        """
        return Box[U](f(self.value))


fn main():
    """Demonstrate generic Box usage."""
    
    # Create a Box[Int]
    var int_box = Box[Int](42)
    print("Int box value:", int_box.get())
    
    # Modify the value
    int_box.set(100)
    print("Updated int box:", int_box.get())
    
    # Create a Box[String]
    var string_box = Box[String]("Hello, Mojo!")
    print("String box value:", string_box.get())
    
    # Generic function that works with any Box[T]
    fn print_box[T](box: Box[T]):
        print("Box contains:", box.get())
    
    print_box(int_box)
    print_box(string_box)
    
    # Generic identity function
    fn identity[T](x: T) -> T:
        return x
    
    let x = identity(42)  # T inferred as Int
    let y = identity("test")  # T inferred as String
    
    print("Identity results:", x, y)
