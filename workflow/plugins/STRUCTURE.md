# Plugin Structure - Multi-Language Support

## Directory Organization

Plugins are organized by **language** first, then by **category**, then by **plugin name**:

```
workflow/plugins/
├── ts/                          # TypeScript plugins (Phase 2 - current)
│   ├── dbal/
│   │   ├── dbal-read/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── src/
│   │   │   ├── dist/
│   │   │   └── README.md
│   │   └── dbal-write/
│   ├── integration/
│   │   ├── http-request/
│   │   ├── email-send/
│   │   └── webhook-response/
│   ├── control-flow/
│   │   └── condition/
│   └── utility/
│       ├── transform/
│       ├── wait/
│       └── set-variable/
│
├── cpp/                         # C++ plugins (Phase 3 - coming)
│   ├── dbal/
│   │   ├── dbal-aggregate/
│   │   │   ├── package.json     # npm package metadata
│   │   │   ├── CMakeLists.txt
│   │   │   ├── src/
│   │   │   │   ├── aggregate.cpp
│   │   │   │   └── aggregate.h
│   │   │   ├── build/
│   │   │   └── README.md
│   │   └── dbal-bulk-ops/
│   │
│   ├── integration/
│   │   ├── s3-upload/
│   │   ├── redis-cache/
│   │   └── kafka-producer/
│   │
│   ├── performance/
│   │   ├── bulk-process/
│   │   └── stream-aggregate/
│   │
│   └── ai/
│       ├── ml-predict/
│       └── vector-search/
│
├── python/                      # Python plugins (future)
│   ├── ai/
│   │   ├── nlp-process/
│   │   └── sentiment-analyze/
│   └── data-science/
│       └── statistical-analysis/
│
└── STRUCTURE.md                 # This file
```

## Plugin Configuration

### TypeScript Plugin (ts/dbal/dbal-read/)

```json
{
  "name": "@metabuilder/workflow-plugin-ts-dbal-read",
  "version": "1.0.0",
  "description": "...",
  "main": "dist/index.js",
  "language": "typescript",
  "nodeType": "dbal-read",
  "category": "dbal"
}
```

### C++ Plugin (cpp/dbal/dbal-aggregate/)

```json
{
  "name": "@metabuilder/workflow-plugin-cpp-dbal-aggregate",
  "version": "1.0.0",
  "description": "High-performance aggregation operations",
  "main": "build/libaggregate.so",
  "language": "c++",
  "nodeType": "dbal-aggregate",
  "category": "dbal",
  "bindings": "node-ffi",
  "build": "cmake",
  "performance": {
    "speedup": "100x vs TypeScript",
    "use_cases": ["large datasets", "complex aggregations"]
  }
}
```

### Python Plugin (python/ai/nlp-process/)

```json
{
  "name": "@metabuilder/workflow-plugin-python-nlp-process",
  "version": "1.0.0",
  "language": "python",
  "nodeType": "nlp-process",
  "category": "ai",
  "runtime": "python3.11",
  "bindings": "child-process"
}
```

## Plugin Registry Enhancement

```typescript
interface PluginMetadata {
  nodeType: string;
  language: 'typescript' | 'c++' | 'python' | 'rust' | 'go';
  category: string;
  version: string;
  bindings?: 'native' | 'node-ffi' | 'child-process' | 'wasm';
  performance?: {
    speedup: string;
    use_cases: string[];
  };
}

interface PluginExecutor {
  language: string;
  executor: INodeExecutor | ExternalProcess;
  loadTime?: number;
  warmupTime?: number;
}
```

## Build & Load Strategy

### TypeScript Plugins
```bash
# Build
cd workflow/plugins/ts/dbal/dbal-read
npm run build

# Load
import { dbalReadExecutor } from '@metabuilder/workflow-plugin-ts-dbal-read'
registry.register('dbal-read', dbalReadExecutor)
```

### C++ Plugins
```bash
# Build
cd workflow/plugins/cpp/dbal/dbal-aggregate
cmake -B build .
cmake --build build

# Load (via native bindings)
const binding = require('@metabuilder/workflow-plugin-cpp-dbal-aggregate');
const executor = new binding.AggregateExecutor();
registry.register('dbal-aggregate', executor)
```

### Python Plugins
```bash
# Install dependencies
cd workflow/plugins/python/ai/nlp-process
pip install -r requirements.txt

# Load (via child process)
const { PythonProcessExecutor } = require('@metabuilder/workflow-plugin-python-nlp-process');
const executor = new PythonProcessExecutor('./src/executor.py');
registry.register('nlp-process', executor)
```

## Phase Roadmap

### Phase 2 (Current) - TypeScript Plugins
✅ Complete
- DBAL: read, write
- Integration: http-request, email-send, webhook-response
- Control-flow: condition
- Utility: transform, wait, set-variable

### Phase 3 - C++ Plugins
🚀 Coming Soon
- DBAL: aggregate, bulk-operations
- Integration: S3, Redis, Kafka connectors
- Performance: Bulk processing, stream aggregation
- AI: ML predictions, vector search

### Phase 4+ - Multi-Language
🔮 Future
- Python: NLP, data science, ML
- Rust: High-performance utilities
- Go: Concurrent operations
- WebAssembly: Browser-side execution

## Plugin Loading Architecture

```typescript
// Enhanced registry with language support
class MultiLanguageNodeExecutorRegistry extends NodeExecutorRegistry {
  private loaders: Map<string, PluginLoader> = new Map();

  constructor() {
    super();
    this.loaders.set('typescript', new TypeScriptPluginLoader());
    this.loaders.set('c++', new NativePluginLoader());
    this.loaders.set('python', new PythonPluginLoader());
  }

  async loadPlugin(language: string, path: string): Promise<void> {
    const loader = this.loaders.get(language);
    if (!loader) throw new Error(`Unknown language: ${language}`);

    const plugin = await loader.load(path);
    this.register(plugin.nodeType, plugin.executor, plugin.metadata);
  }

  async loadAllPlugins(baseDir: string): Promise<void> {
    const languages = ['ts', 'cpp', 'python'];

    for (const lang of languages) {
      const categoryPath = path.join(baseDir, lang);
      const categories = await fs.readdir(categoryPath);

      for (const category of categories) {
        const pluginPath = path.join(categoryPath, category);
        const plugins = await fs.readdir(pluginPath);

        for (const plugin of plugins) {
          await this.loadPlugin(lang, path.join(pluginPath, plugin));
        }
      }
    }
  }
}
```

## Example Multi-Language Workflow

```json
{
  "id": "wf-hybrid-processing",
  "name": "TS + C++ + Python Hybrid",
  "nodes": [
    {
      "id": "read-data",
      "nodeType": "dbal-read",
      "language": "typescript",
      "parameters": { "entity": "Dataset", "limit": 10000 }
    },
    {
      "id": "aggregate",
      "nodeType": "dbal-aggregate",
      "language": "c++",
      "parameters": { "groupBy": "category", "aggregates": ["count", "sum"] }
    },
    {
      "id": "analyze",
      "nodeType": "nlp-process",
      "language": "python",
      "parameters": { "model": "bert", "task": "sentiment" }
    },
    {
      "id": "send-result",
      "nodeType": "email-send",
      "language": "typescript",
      "parameters": { "to": "team@example.com", "body": "{{ $json.result }}" }
    }
  ]
}
```

## Performance Characteristics by Language

| Language | Execution Speed | Memory | Startup | Best For |
|----------|-----------------|--------|---------|----------|
| TypeScript | 1x baseline | High | Fast | Orchestration, logic |
| C++ | 100-1000x | Low | Slow | Bulk ops, aggregations |
| Python | 0.1-1x | Medium | Medium | ML, data science |
| Rust | 100-500x | Low | Slow | Concurrent ops |

## Best Practices

### Choose Language Based On:

**TypeScript**
- ✅ REST APIs and webhooks
- ✅ JSON transformations
- ✅ Simple orchestration
- ✅ Rapid development

**C++**
- ✅ Large dataset processing (1M+ rows)
- ✅ Complex aggregations
- ✅ Performance-critical operations
- ✅ Bulk operations

**Python**
- ✅ Machine learning tasks
- ✅ Natural language processing
- ✅ Data science operations
- ✅ Complex statistical analysis

## Migration Path

1. **Start**: Build plugins in TypeScript (fast iteration)
2. **Measure**: Identify performance bottlenecks
3. **Optimize**: Convert hot paths to C++
4. **Extend**: Add Python ML capabilities
5. **Scale**: Add Rust for concurrent operations

## File Naming Convention

```
workflow/plugins/{language}/{category}/{plugin-name}/

Examples:
  workflow/plugins/ts/dbal/dbal-read/
  workflow/plugins/cpp/dbal/dbal-aggregate/
  workflow/plugins/python/ai/nlp-process/
  workflow/plugins/rust/concurrent/batch-processor/
```

## Package Naming Convention

```
@metabuilder/workflow-plugin-{language}-{category}-{plugin}

Examples:
  @metabuilder/workflow-plugin-ts-dbal-read
  @metabuilder/workflow-plugin-cpp-dbal-aggregate
  @metabuilder/workflow-plugin-python-ai-nlp
```
