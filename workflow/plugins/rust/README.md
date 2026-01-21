# Rust Workflow Plugins

High-performance Rust plugins for MetaBuilder workflow engine.

## Plugin Interface

```rust
// All plugins implement this signature
pub fn run(runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult;
```

The `runtime` object provides:
- `store` - Workflow state storage (persists between nodes)
- `context` - Shared context (clients, configuration)

## Categories

| Category | Plugins | Purpose |
|----------|---------|---------|
| convert | to_string, to_number, to_boolean, to_json, parse_json, to_list, to_object | Type conversion |
| list | concat, length, slice, reverse, first, last, at, contains, index_of, unique | List operations |
| logic | and, or, not, xor, equals, gt, gte, lt, lte, is_in | Boolean logic |
| math | add, subtract, multiply, divide, modulo, power, abs, round | Arithmetic |
| string | concat, split, replace, upper, lower, trim, length, contains, starts_with, ends_with | String manipulation |
| var | get, set, delete, exists, keys, clear | Variable management |

## Building

```bash
cd workflow/plugins/rust
cargo build --release
```

## Example Usage

### In Workflow JSON

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "process-data",
      "type": "operation",
      "op": "rust.list.unique",
      "params": {
        "list": [1, 2, 2, 3, 3, 3, 4]
      }
    }
  ]
}
```

## Performance

Rust plugins offer:
- **100-1000x faster** than Python for CPU-bound operations
- **Zero-cost abstractions** - no runtime overhead
- **Memory safety** - guaranteed by compiler
- **Native FFI** - can be called from any language

Best for:
- High-performance data processing
- Memory-intensive operations
- Bulk transformations (1M+ items)
- Security-critical operations
