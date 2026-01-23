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

"""Runtime support module for the Mojo compiler.

This module provides runtime support for:
- Memory management
- Async/coroutine runtime
- Type reflection
- String and collection operations
- C library interoperability
- Python interoperability
"""

from .memory import malloc, free, realloc
from .async_runtime import AsyncExecutor
from .reflection import get_type_info, type_name

__all__ = ["malloc", "free", "realloc", "AsyncExecutor", "get_type_info", "type_name"]
