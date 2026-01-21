# Workflow Executor Runtimes

This folder contains language-specific runtime executors for the workflow engine.

## Structure

```
executor/
├── cpp/        # C++ runtime (high-performance)
├── python/     # Python runtime (AI/ML capabilities)
└── ts/         # TypeScript runtime + core engine
    ├── executor/   # DAG executor
    ├── registry/   # Plugin registry
    ├── utils/      # Priority queue, template engine
    ├── types.ts    # Type definitions
    └── index.ts    # Main exports
```

## Purpose

Each runtime provides the execution environment for plugins written in that language:

### TypeScript Runtime (`ts/`)
- **Contains the core engine** (DAG executor, registry, utils)
- Default runtime for orchestration
- Direct JavaScript/TypeScript execution
- Full type safety
- Fastest startup time

### Python Runtime (`python/`)
- Child process execution
- AI/ML library access (TensorFlow, PyTorch, transformers)
- Data science capabilities (pandas, numpy)
- NLP processing (spaCy, NLTK)

### C++ Runtime (`cpp/`)
- Native FFI bindings
- 100-1000x faster than TypeScript
- Low memory footprint
- Ideal for bulk data processing

## How It Works

```
┌─────────────────────────────────────────┐
│  DAGExecutor (TypeScript Core)          │
│  - Orchestrates workflow execution      │
│  - Resolves dependencies                │
│  - Manages execution state              │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ↓         ↓         ↓
    ┌────────┬────────┬────────┐
    │   TS   │  C++   │ Python │
    │Runtime │Runtime │Runtime │
    └────────┴────────┴────────┘
        │         │         │
        ↓         ↓         ↓
    ┌────────┬────────┬────────┐
    │Direct  │Native  │Child   │
    │Import  │FFI     │Process │
    └────────┴────────┴────────┘
```

## Adding a New Runtime

1. Create folder: `executor/{language}/`
2. Implement `PluginLoader` interface
3. Register loader in `ts/registry/node-executor-registry.ts`
4. Add plugins to `plugins/{language}/`
