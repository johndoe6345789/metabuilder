# Plugin Migration to Multi-Language Structure

## Current State → New State

### Old Structure (Flat)
```
workflow/plugins/
├── dbal-read/
├── dbal-write/
├── http-request/
├── email-send/
├── webhook-response/
├── condition/
├── transform/
├── wait/
└── set-variable/
```

### New Structure (Language + Category)
```
workflow/plugins/
├── ts/                    # TypeScript (Phase 2)
│   ├── dbal/
│   │   ├── dbal-read/
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
├── cpp/                   # C++ (Phase 3 - prepare now)
│   ├── dbal/              # High-perf aggregations
│   ├── integration/       # Native connectors (S3, Redis, Kafka)
│   └── performance/       # Bulk operations
└── python/                # Python (Phase 4+)
    ├── ai/                # ML, NLP
    └── data-science/      # Statistical analysis
```

## Migration Steps

### 1. Reorganize Existing TypeScript Plugins

```bash
# Backup current plugins
cp -r workflow/plugins workflow/plugins.backup

# Create language structure
mkdir -p workflow/plugins/ts/{dbal,integration,control-flow,utility}
mkdir -p workflow/plugins/{cpp,python}

# Move plugins
mv workflow/plugins/dbal-read workflow/plugins/ts/dbal/
mv workflow/plugins/dbal-write workflow/plugins/ts/dbal/
mv workflow/plugins/http-request workflow/plugins/ts/integration/
mv workflow/plugins/email-send workflow/plugins/ts/integration/
mv workflow/plugins/webhook-response workflow/plugins/ts/integration/
mv workflow/plugins/condition workflow/plugins/ts/control-flow/
mv workflow/plugins/transform workflow/plugins/ts/utility/
mv workflow/plugins/wait workflow/plugins/ts/utility/
mv workflow/plugins/set-variable workflow/plugins/ts/utility/

# Clean up old flat structure
rm -rf workflow/plugins/dbal-read workflow/plugins/dbal-write # etc (if different paths)
```

### 2. Update package.json Names

For each plugin, update the name to include language and category:

**Before:**
```json
{
  "name": "@metabuilder/workflow-plugin-dbal-read"
}
```

**After:**
```json
{
  "name": "@metabuilder/workflow-plugin-ts-dbal-read",
  "language": "typescript",
  "category": "dbal",
  "nodeType": "dbal-read"
}
```

### 3. Update TypeScript Imports

The imports from @metabuilder/workflow remain the same, but the plugin paths change:

**Before:**
```typescript
import { dbalReadExecutor } from '@metabuilder/workflow-plugin-dbal-read';
```

**After:**
```typescript
import { dbalReadExecutor } from '@metabuilder/workflow-plugin-ts-dbal-read';
```

Or use the new registry auto-loader:
```typescript
await registry.loadAllPlugins('workflow/plugins');
```

### 4. Create C++ Plugin Template (for Phase 3)

```bash
mkdir -p workflow/plugins/cpp/dbal/dbal-aggregate/{src,build}
mkdir -p workflow/plugins/cpp/integration/{s3-upload,redis-cache,kafka-producer}

# Create C++ plugin template files
cat > workflow/plugins/cpp/dbal/dbal-aggregate/package.json << 'EOF'
{
  "name": "@metabuilder/workflow-plugin-cpp-dbal-aggregate",
  "version": "1.0.0",
  "language": "c++",
  "category": "dbal",
  "nodeType": "dbal-aggregate",
  "main": "build/libaggregate.so",
  "build": "cmake",
  "bindings": "node-ffi"
}
EOF

cat > workflow/plugins/cpp/dbal/dbal-aggregate/CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.10)
project(workflow-plugin-dbal-aggregate)

set(CMAKE_CXX_STANDARD 17)

add_library(aggregate SHARED
  src/aggregate.cpp
)

target_include_directories(aggregate PRIVATE include)
EOF
```

### 5. Prepare Python Plugin Template (for Phase 4+)

```bash
mkdir -p workflow/plugins/python/ai/{nlp-process,sentiment-analyze}
mkdir -p workflow/plugins/python/data-science/statistical-analysis

cat > workflow/plugins/python/ai/nlp-process/package.json << 'EOF'
{
  "name": "@metabuilder/workflow-plugin-python-nlp-process",
  "version": "1.0.0",
  "language": "python",
  "category": "ai",
  "nodeType": "nlp-process",
  "runtime": "python3.11",
  "bindings": "child-process"
}
EOF

cat > workflow/plugins/python/ai/nlp-process/requirements.txt << 'EOF'
transformers>=4.30.0
torch>=2.0.0
numpy>=1.24.0
EOF
```

## Package Publishing Strategy

### TypeScript Plugins
```bash
cd workflow/plugins/ts/dbal/dbal-read
npm publish --access public
```

### C++ Plugins (with prebuilt binaries)
```bash
cd workflow/plugins/cpp/dbal/dbal-aggregate
npm run build:native
npm publish --access public
```

### Python Plugins (via pip)
```bash
cd workflow/plugins/python/ai/nlp-process
python -m build
python -m twine upload dist/*
```

## Registry Auto-Discovery

New loader that scans directory structure:

```typescript
async function loadAllPlugins(baseDir: string): Promise<void> {
  const languages = await fs.readdir(path.join(baseDir, 'plugins'));

  for (const lang of languages) {
    if (lang === 'STRUCTURE.md' || lang === 'MIGRATION.md') continue;

    const langPath = path.join(baseDir, 'plugins', lang);
    const categories = await fs.readdir(langPath);

    for (const category of categories) {
      const categoryPath = path.join(langPath, category);
      const plugins = await fs.readdir(categoryPath);

      for (const pluginName of plugins) {
        const pluginPath = path.join(categoryPath, pluginName);
        const packageJson = JSON.parse(
          await fs.readFile(path.join(pluginPath, 'package.json'), 'utf-8')
        );

        // Load based on language
        if (lang === 'ts') {
          const module = require(pluginPath);
          registry.register(packageJson.nodeType, module[`${pluginName}Executor`]);
        } else if (lang === 'cpp') {
          const binding = require(path.join(pluginPath, packageJson.main));
          registry.register(packageJson.nodeType, new binding.Executor());
        } else if (lang === 'python') {
          const executor = new PythonProcessExecutor(
            path.join(pluginPath, 'src/executor.py')
          );
          registry.register(packageJson.nodeType, executor);
        }
      }
    }
  }
}
```

## Breaking Changes

### For Users

If publishing plugins to npm:
```json
{
  "old": "@metabuilder/workflow-plugin-dbal-read",
  "new": "@metabuilder/workflow-plugin-ts-dbal-read"
}
```

Update imports:
```typescript
// Old
import { dbalReadExecutor } from '@metabuilder/workflow-plugin-dbal-read';

// New
import { dbalReadExecutor } from '@metabuilder/workflow-plugin-ts-dbal-read';
```

### For Plugin Developers

New naming convention:
```
@metabuilder/workflow-plugin-{language}-{category}-{plugin}

Examples:
  @metabuilder/workflow-plugin-ts-dbal-read
  @metabuilder/workflow-plugin-cpp-dbal-aggregate
  @metabuilder/workflow-plugin-python-ai-nlp
```

## Backward Compatibility

To maintain backward compatibility, create alias packages:

```json
// @metabuilder/workflow-plugin-dbal-read/package.json
{
  "name": "@metabuilder/workflow-plugin-dbal-read",
  "version": "1.0.0",
  "deprecated": "Use @metabuilder/workflow-plugin-ts-dbal-read instead",
  "main": "node_modules/@metabuilder/workflow-plugin-ts-dbal-read/dist/index.js"
}
```

## Timeline

### Week 1-2: Phase 2 (Current)
- ✅ Reorganize existing TypeScript plugins
- ✅ Update package.json with language/category
- ✅ Update imports in Next.js integration
- ✅ Test all plugins work in new structure

### Week 3-4: Phase 3 Prep
- Create C++ plugin templates
- Set up build system (CMake)
- Document C++ plugin development
- Create example C++ plugin

### Week 5+: Phase 3 & Beyond
- Implement C++ plugins (dbal-aggregate, connectors)
- Performance testing and benchmarks
- Python plugin templates
- Multi-language execution testing
