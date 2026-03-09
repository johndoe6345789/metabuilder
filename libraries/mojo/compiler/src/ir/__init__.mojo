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

"""IR generation module for the Mojo compiler.

This module handles lowering of typed AST to MLIR.
It defines Mojo-specific MLIR dialects and operations.
"""

from .mlir_gen import MLIRGenerator
from .mojo_dialect import MojoDialect

__all__ = ["MLIRGenerator", "MojoDialect"]
