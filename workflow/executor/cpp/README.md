# C++ Plugin Executor

High-performance native runtime for C++ workflow plugins.

## Status

**Phase 3** - Framework ready, implementation pending.

## Architecture

```
┌─────────────────────────────────────────┐
│  TypeScript (Node.js)                   │
│  - DAGExecutor calls native binding     │
└─────────────────┬───────────────────────┘
                  │ node-ffi / node-addon-api
                  ↓
┌─────────────────────────────────────────┐
│  C++ Shared Library (.so/.dylib/.dll)   │
│  - Native plugin execution              │
│  - Direct memory access                 │
│  - Parallel processing                  │
└─────────────────────────────────────────┘
```

## Build System

Uses CMake for cross-platform builds:

```bash
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

## Interface

```cpp
// executor.h
extern "C" {
    // Execute a plugin and return JSON result
    const char* execute_plugin(
        const char* plugin_name,
        const char* inputs_json,
        const char* context_json
    );

    // Free result memory
    void free_result(const char* result);

    // List available plugins
    const char* list_plugins();
}
```

## Planned Plugins

- `dbal-aggregate` - High-performance data aggregation (1000x faster)
- `dbal-bulk-operations` - Bulk insert/update operations
- `s3-upload` - Native S3 upload with multipart
- `redis-cache` - Native Redis client
- `kafka-producer` - Native Kafka producer
- `bulk-process` - Parallel data processing
- `stream-aggregate` - Streaming aggregation

## Performance Targets

| Operation | TypeScript | C++ Target |
|-----------|------------|------------|
| Large aggregation | 1.0x | 100-1000x |
| Bulk operations | 1.0x | 50-100x |
| JSON parsing | 1.0x | 10-50x |
| Memory usage | 1.0x | 0.1-0.3x |
