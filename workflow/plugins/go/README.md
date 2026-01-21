# Go Workflow Plugins

Go plugins for MetaBuilder workflow engine. Follows the same interface pattern as Python plugins.

## Plugin Interface

```go
// All plugins implement this signature
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error)
```

The `runtime` object provides:
- `Store` - Workflow state storage (persists between nodes)
- `Context` - Shared context (clients, configuration)
- `Logger` - Logging interface

## Categories

| Category | Plugins | Purpose |
|----------|---------|---------|
| convert | to_string, to_number, to_boolean, to_json, parse_json | Type conversion |
| list | concat, length, slice, reverse | List operations |
| logic | and, or, not, equals, gt, lt | Boolean logic |
| math | add, subtract, multiply, divide | Arithmetic |
| string | concat, split, replace, upper, lower | String manipulation |
| var | get, set, delete | Variable management |

## Example Usage

### In Workflow JSON

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "add-numbers",
      "type": "operation",
      "op": "go.math.add",
      "params": {
        "numbers": [1, 2, 3, 4, 5]
      }
    },
    {
      "id": "format-result",
      "type": "operation",
      "op": "go.string.concat",
      "params": {
        "strings": ["Sum: ", "{{ $nodes['add-numbers'].result }}"],
        "separator": ""
      }
    }
  ],
  "connections": [
    { "from": "add-numbers", "to": "format-result" }
  ]
}
```

## Performance

Go plugins are compiled to native code, offering:
- **10-100x faster** than Python for CPU-bound operations
- **Low memory footprint** for concurrent execution
- **No GIL** - true parallelism

Best for:
- High-throughput data processing
- Concurrent operations
- Memory-efficient batch operations
