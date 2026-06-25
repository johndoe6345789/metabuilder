# C++ Workflow Plugins

High-performance C++ plugins for MetaBuilder workflow engine.

## Plugin Interface

```cpp
// All plugins implement this signature
PluginResult pluginName(Runtime& runtime, const json& inputs);
```

The `runtime` object provides:
- `store` - Workflow state storage (persists between nodes)
- `context` - Shared context (clients, configuration)

## Categories

| Category | Plugins | Purpose |
|----------|---------|---------|
| convert | to_string, to_number, to_boolean, to_json, parse_json, to_list, to_object | Type conversion |
| list | concat, length, slice, reverse, first, last, at, contains, index_of, unique | List operations |
| logic | and, or, not, xor, equals, gt, gte, lt, lte, in | Boolean logic |
| math | add, subtract, multiply, divide, modulo, power, abs, round, min, max | Arithmetic |
| string | concat, split, replace, upper, lower, trim, length, contains, starts_with, ends_with | String manipulation |
| var | get, set, delete, exists, keys, clear | Variable management |

## Structure

Header-only library matching Python plugin structure:
```
cpp/
├── plugin.hpp              # Core types (Runtime, PluginResult)
├── math/
│   ├── package.json        # Category manifest with plugin list
│   ├── math_add/
│   │   ├── math_add.hpp    # Plugin implementation
│   │   └── package.json    # Plugin metadata
│   └── ...
└── string/
    └── ...
```

## Usage

Include the header-only plugin you need:
```cpp
#include <nlohmann/json.hpp>
#include "workflow/plugins/cpp/math/math_add/math_add.hpp"

// Use the plugin
metabuilder::workflow::Runtime runtime;
auto result = metabuilder::workflow::math::add(runtime, {{"numbers", {1, 2, 3}}});
```

## Example Usage

### In Workflow JSON

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "bulk-process",
      "type": "operation",
      "op": "cpp.list.unique",
      "params": {
        "list": "{{ $largeDataset }}"
      }
    }
  ]
}
```

## Performance

C++ plugins offer:
- **100-1000x faster** than Python for CPU-bound operations
- **Zero overhead** for number crunching
- **Native SIMD** support for vectorized operations
- **Direct memory access** for large datasets

Best for:
- Bulk data processing (1M+ items)
- Complex aggregations
- Performance-critical paths
- Memory-intensive operations

## Integration

The plugin library compiles to a shared library that can be:
- Loaded via FFI from TypeScript/Python
- Linked directly into C++ executors
- Called via workflow engine's native executor
