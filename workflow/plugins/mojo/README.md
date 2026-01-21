# Mojo Workflow Plugins

This directory contains workflow plugins implemented in Mojo, a Python superset with systems programming capabilities.

## Overview

Mojo plugins provide high-performance implementations for workflow operations while maintaining Python interoperability. This allows seamless integration with the existing Python-based workflow system while enabling performance-critical optimizations.

## Directory Structure

```
mojo/
├── plugin.mojo          # Base types and traits for all plugins
├── README.md            # This file
├── math/                # Mathematical operation plugins
│   ├── package.json     # Category manifest
│   ├── math_add.mojo
│   ├── math_subtract.mojo
│   ├── math_multiply.mojo
│   └── math_divide.mojo
├── string/              # String manipulation plugins
│   ├── package.json     # Category manifest
│   ├── string_concat.mojo
│   ├── string_upper.mojo
│   ├── string_lower.mojo
│   └── string_length.mojo
└── list/                # List operation plugins
    ├── package.json     # Category manifest
    ├── list_concat.mojo
    ├── list_length.mojo
    └── list_reverse.mojo
```

## Plugin Pattern

Each plugin follows a standard pattern:

```mojo
# Workflow plugin: <description>

from collections import Dict
from python import PythonObject

fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """<Plugin description>."""
    # Extract inputs
    var value = inputs.get("key", default_value)

    # Perform operation
    var result = compute(value)

    # Return result
    return Dict[String, PythonObject]{"result": result}
```

## Categories

### Math Plugins

Mathematical operations on numbers:

| Plugin | Type | Description |
|--------|------|-------------|
| `math_add.mojo` | `math.add` | Add two or more numbers |
| `math_subtract.mojo` | `math.subtract` | Subtract numbers sequentially |
| `math_multiply.mojo` | `math.multiply` | Multiply two or more numbers |
| `math_divide.mojo` | `math.divide` | Divide numbers sequentially |

### String Plugins

String manipulation operations:

| Plugin | Type | Description |
|--------|------|-------------|
| `string_concat.mojo` | `string.concat` | Concatenate strings |
| `string_upper.mojo` | `string.upper` | Convert string to uppercase |
| `string_lower.mojo` | `string.lower` | Convert string to lowercase |
| `string_length.mojo` | `string.length` | Get string length |

### List Plugins

List/array operations:

| Plugin | Type | Description |
|--------|------|-------------|
| `list_concat.mojo` | `list.concat` | Concatenate multiple lists |
| `list_length.mojo` | `list.length` | Get list length |
| `list_reverse.mojo` | `list.reverse` | Reverse a list |

## Package Manifest

Each category has a `package.json` manifest:

```json
{
  "name": "category_name",
  "version": "1.0.0",
  "description": "Category description",
  "metadata": {
    "plugin_type": "category.operation",
    "language": "mojo"
  },
  "plugins": [
    {
      "name": "plugin_name",
      "file": "plugin_file.mojo",
      "type": "category.operation",
      "description": "Plugin description"
    }
  ]
}
```

## Mojo Advantages

Mojo provides several advantages for workflow plugins:

1. **Performance**: Systems-level performance with SIMD and parallel processing
2. **Python Interop**: Seamless integration with Python objects and libraries
3. **Type Safety**: Strong typing with compile-time checks
4. **Memory Safety**: Ownership and borrowing model for safe memory management
5. **Hardware Access**: Direct access to hardware features when needed

## Usage

Plugins can be loaded and executed by the workflow runtime:

```python
# Python integration example
from workflow.loader import load_mojo_plugin

plugin = load_mojo_plugin("math/math_add.mojo")
result = plugin.run({"numbers": [1, 2, 3, 4, 5]})
print(result["result"])  # Output: 15.0
```

## Building Plugins

To compile Mojo plugins:

```bash
# Compile a single plugin
mojo build math/math_add.mojo

# Compile all plugins in a category
for f in math/*.mojo; do mojo build "$f"; done
```

## Testing

Each plugin can be tested independently:

```bash
# Run plugin tests
mojo test math/math_add.mojo
```

## Contributing

When adding new plugins:

1. Follow the standard plugin pattern
2. Implement the `run` function with proper input/output handling
3. Add the plugin to the category's `package.json`
4. Update this README with the new plugin information
5. Add appropriate tests
