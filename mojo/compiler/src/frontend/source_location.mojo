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

"""Source location tracking for the Mojo compiler.

This module provides utilities for tracking source code locations
for error reporting and debugging.
"""


struct SourceLocation:
    """Represents a location in source code.
    
    Used for error reporting and debugging.
    """
    
    var filename: String
    var line: Int
    var column: Int
    
    fn __init__(inout self, filename: String, line: Int, column: Int):
        """Initialize a source location.
        
        Args:
            filename: The name of the source file.
            line: The line number (1-indexed).
            column: The column number (1-indexed).
        """
        self.filename = filename
        self.line = line
        self.column = column
    
    fn __str__(self) -> String:
        """Get a string representation of the location.
        
        Returns:
            A string in the format "filename:line:column".
        """
        return self.filename + ":" + str(self.line) + ":" + str(self.column)
