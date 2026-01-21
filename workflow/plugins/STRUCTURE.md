# Plugin Structure - Multi-Language Support

## Directory Organization

Plugins are organized by **language** first, then by **category**:

```
workflow/
├── executor/                # Language-specific runtimes
│   ├── ts/                  # TypeScript runtime + core engine
│   │   ├── executor/        # DAG executor
│   │   ├── registry/        # Plugin registry
│   │   ├── utils/           # Priority queue, template engine
│   │   ├── types.ts         # Type definitions
│   │   └── index.ts         # Main exports
│   ├── python/              # Python executor (child process)
│   └── cpp/                 # C++ executor (native FFI)
│
├── plugins/                 # All plugins by language
│   ├── ts/                  # TypeScript plugins
│   │   ├── dbal/
│   │   │   ├── dbal-read/
│   │   │   └── dbal-write/
│   │   ├── integration/
│   │   │   ├── http-request/
│   │   │   ├── email-send/
│   │   │   └── webhook-response/
│   │   ├── control-flow/
│   │   │   └── condition/
│   │   └── utility/
│   │       ├── transform/
│   │       ├── wait/
│   │       └── set-variable/
│   │
│   └── python/              # Python plugins (from AutoMetabuilder)
│       ├── control/         # Bot control, switch logic
│       ├── convert/         # Type conversions
│       ├── core/            # AI requests, message handling
│       ├── dict/            # Dictionary operations
│       ├── list/            # List operations
│       ├── logic/           # Boolean logic
│       ├── math/            # Mathematical operations
│       ├── notifications/   # Slack, Discord
│       ├── string/          # String manipulation
│       ├── test/            # Unit testing assertions
│       ├── tools/           # External tool integration
│       ├── utils/           # Utility functions
│       ├── var/             # Variable management
│       └── web/             # Flask server, API endpoints
│
├── package.json
└── tsconfig.json
```

## Plugin Categories

### TypeScript Plugins (`plugins/ts/`)

| Category | Plugins | Purpose |
|----------|---------|---------|
| dbal | dbal-read, dbal-write | Database operations |
| integration | http-request, email-send, webhook-response | External services |
| control-flow | condition | Workflow control |
| utility | transform, wait, set-variable | Data manipulation |

### Python Plugins (`plugins/python/`)

| Category | Plugins | Purpose |
|----------|---------|---------|
| control | control_switch, control_start_bot, control_get_bot_status | Bot control |
| convert | convert_to_*, convert_parse_json | Type conversion |
| core | core_ai_request, core_load_context, core_run_tool_calls | AI operations |
| dict | dict_get, dict_set, dict_keys, dict_values, dict_merge | Dictionary ops |
| list | list_concat, list_find, list_sort, list_slice | List operations |
| logic | logic_and, logic_or, logic_equals, logic_gt, logic_lt | Comparisons |
| math | math_add, math_subtract, math_multiply, math_divide | Arithmetic |
| notifications | notifications_slack, notifications_discord | Notifications |
| string | string_concat, string_split, string_replace, string_format | String ops |
| test | test_assert_equals, test_assert_true, test_run_suite | Testing |
| tools | tools_read_file, tools_run_tests, tools_run_docker | External tools |
| utils | utils_filter_list, utils_map_list, utils_check_mvp | Utilities |
| var | var_get, var_set, var_delete, var_exists | Variables |
| web | web_create_flask_app, web_start_server, web_get_env_vars | Web/Flask |

## Plugin Interface

### TypeScript Plugin

```typescript
// plugins/ts/dbal/dbal-read/src/index.ts
export class DBALReadExecutor implements INodeExecutor {
  nodeType = 'dbal-read';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    // Implementation
  }
}
```

### Python Plugin

```python
# plugins/python/math/math_add.py
def run(_runtime, inputs):
    """Add two or more numbers."""
    numbers = inputs.get("numbers", [])
    return {"result": sum(numbers)}
```

## Execution Flow

```
┌─────────────────────────────────────────┐
│  DAGExecutor (executor/ts/executor/)    │
│  - Resolves node dependencies           │
│  - Schedules execution                  │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  NodeExecutorRegistry (executor/ts/)    │
│  - Looks up plugin by nodeType          │
│  - Determines language from metadata    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ↓         ↓         ↓
    ┌────────┬────────┬────────┐
    │   TS   │ Python │  C++   │
    │Executor│Executor│Executor│
    └────────┴────────┴────────┘
        │         │         │
        ↓         ↓         ↓
    ┌────────┬────────┬────────┐
    │plugins/│plugins/│plugins/│
    │  ts/   │python/ │  cpp/  │
    └────────┴────────┴────────┘
```

## Performance Characteristics

| Language | Execution Speed | Memory | Startup | Best For |
|----------|-----------------|--------|---------|----------|
| TypeScript | 1x baseline | High | Fast | Orchestration, logic |
| Python | 0.1-1x | Medium | Medium | AI/ML, data science |
| C++ | 100-1000x | Low | Slow | Bulk ops, aggregations |

## Best Practices

### Choose Language Based On:

**TypeScript**
- REST APIs and webhooks
- JSON transformations
- Simple orchestration
- Rapid development

**Python**
- Machine learning tasks
- Natural language processing
- Data science operations
- AI model integration

**C++**
- Large dataset processing (1M+ rows)
- Complex aggregations
- Performance-critical operations
- Memory-intensive operations
