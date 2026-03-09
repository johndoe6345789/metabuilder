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

"""Memory management runtime support.

This module provides memory allocation and deallocation functions
that integrate with the system allocator (malloc/free).
"""

from sys.ffi import external_call


fn malloc(size: Int) -> UnsafePointer[UInt8]:
    """Allocate memory of the specified size.
    
    Args:
        size: The number of bytes to allocate.
        
    Returns:
        A pointer to the allocated memory, or null on failure.
    """
    # Call C's malloc
    return external_call["malloc", UnsafePointer[UInt8]](size)


fn free(ptr: UnsafePointer[UInt8]):
    """Free previously allocated memory.
    
    Args:
        ptr: The pointer to free.
    """
    # Call C's free
    _ = external_call["free", NoneType](ptr)


fn realloc(ptr: UnsafePointer[UInt8], new_size: Int) -> UnsafePointer[UInt8]:
    """Reallocate memory to a new size.
    
    Args:
        ptr: The pointer to reallocate.
        new_size: The new size in bytes.
        
    Returns:
        A pointer to the reallocated memory, or null on failure.
    """
    # Call C's realloc
    return external_call["realloc", UnsafePointer[UInt8]](ptr, new_size)


fn calloc(count: Int, size: Int) -> UnsafePointer[UInt8]:
    """Allocate and zero-initialize memory.
    
    Args:
        count: The number of elements.
        size: The size of each element in bytes.
        
    Returns:
        A pointer to the allocated and zeroed memory, or null on failure.
    """
    # Call C's calloc
    return external_call["calloc", UnsafePointer[UInt8]](count, size)


# Reference counting support (if needed)
fn retain[T: AnyType](ptr: UnsafePointer[T]):
    """Increment the reference count of a value.
    
    Args:
        ptr: Pointer to the value.
    """
    # TODO: Implement reference counting if needed
    pass


fn release[T: AnyType](ptr: UnsafePointer[T]):
    """Decrement the reference count of a value.
    
    If the reference count reaches zero, the value is deallocated.
    
    Args:
        ptr: Pointer to the value.
    """
    # TODO: Implement reference counting if needed
    pass
