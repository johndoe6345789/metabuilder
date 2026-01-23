# Plugin Registry Implementation - Quick Start Guide

**For**: Development Team
**Purpose**: Fast reference during implementation
**Complexity**: Medium

---

## File Organization at a Glance

```
workflow/executor/ts/
├── registry/                          ← Core registry system
│   ├── node-executor-registry.ts      (MODIFY: add cache/tenant support)
│   ├── plugin-registry.ts             (CREATE: enhanced registry)
│   └── plugin-discovery.ts            (CREATE: dynamic loading)
│
├── cache/                             ← Caching layer
│   └── executor-cache.ts              (CREATE: LRU cache)
│
├── validation/                        ← Validation system
│   └── plugin-validator.ts            (CREATE: pre-execution validation)
│
├── multi-tenant/                      ← Security
│   └── tenant-safety.ts               (CREATE: isolation enforcement)
│
├── error-handling/                    ← Error recovery
│   └── error-recovery.ts              (CREATE: fallback strategies)
│
├── executor/
│   └── dag-executor.ts                (MODIFY: integrate error handling)
│
├── plugins/
│   └── index.ts                       (MODIFY: add metadata to registrations)
│
├── types.ts                           (MODIFY: extend interfaces)
└── index.ts                           (UPDATE: new exports)
```

---

## Critical Integration Points

### 1. Registry Initialization

**Current** (in `plugins/index.ts`):
```typescript
registry.register('dbal-read', dbalReadExecutor);
```

**Target** (with metadata):
```typescript
registry.registerWithMetadata('dbal-read', dbalReadExecutor, {
  nodeType: 'dbal-read',
  version: '1.0.0',
  category: 'dbal',
  description: 'Read from database with filtering and pagination',
  requiredFields: ['entity'],
  tags: ['database', 'query', 'read']
});
```

### 2. Node Execution Flow

**Current** (in `dag-executor.ts`):
```typescript
const result = await this.nodeExecutor(node.id, this.workflow, this.context, this.state);
```

**Target** (with error handling):
```typescript
try {
  const result = await this.nodeExecutor(node.id, this.workflow, this.context, this.state);
  return result;
} catch (error) {
  // Apply error recovery strategy
  const strategy = node.errorRecoveryStrategy || this.workflow.errorRecovery;
  return registry.execute(node.nodeType, node, this.context, this.state, strategy);
}
```

### 3. Multi-Tenant Check

**Before execution** (add to `dag-executor.ts`):
```typescript
// Check if node type is allowed for this tenant
if (!this.registry.tenantManager.isNodeTypeAllowed(context.tenantId, node.nodeType)) {
  throw new TenantSecurityError(`NodeType ${node.nodeType} not allowed`);
}
```

### 4. Cache Integration

**In registry execute method**:
```typescript
async execute(nodeType: string, node, context, state, strategy?) {
  // Hit cache first
  let executor = this.cache.get(nodeType);

  if (!executor) {
    executor = this.executors.get(nodeType);
    if (!executor) throw new Error(`Unknown node type: ${nodeType}`);
    this.cache.set(nodeType, executor);  // Cache for future use
  }

  return await executor.execute(node, context, state);
}
```

---

## Implementation Checklist

### Phase 1: Core Registry
- [ ] Create `plugin-registry.ts` with base methods
- [ ] Add `execute()`, `registerWithMetadata()`, `getMetadata()`
- [ ] Extend `types.ts` with `PluginMetadata`
- [ ] Update `plugins/index.ts` to register all with metadata
- [ ] Write 50+ unit tests

### Phase 2: Caching
- [ ] Create `executor-cache.ts` with LRU implementation
- [ ] Add to registry as `cache` property
- [ ] Modify `execute()` to check cache first
- [ ] Write 30+ cache behavior tests
- [ ] Run performance benchmarks

### Phase 3: Multi-Tenant
- [ ] Create `tenant-safety.ts`
- [ ] Implement `isNodeTypeAllowed()`, `enforceDataIsolation()`
- [ ] Add to registry as `tenantManager` property
- [ ] Add check in `dag-executor.ts` pre-execution
- [ ] Write 40+ security tests

### Phase 4: Error Handling
- [ ] Create `error-recovery.ts`
- [ ] Create `plugin-validator.ts`
- [ ] Implement recovery strategies: fallback, skip, retry, fail
- [ ] Enhance `dag-executor.ts` catch block
- [ ] Write 60+ error handling tests

### Phase 5: Discovery
- [ ] Create `plugin-discovery.ts`
- [ ] Implement `discoverPlugins()`, `loadPlugin()`
- [ ] Add to `registerBuiltInExecutors()` optionally
- [ ] Write 30+ discovery tests

### Phase 6: Testing & Documentation
- [ ] Reach 90%+ test coverage
- [ ] Run load tests (1000+ concurrent)
- [ ] Write API documentation
- [ ] Create 5+ code examples
- [ ] Get code review sign-off

---

## Key Code Patterns

### Pattern 1: Registering a Plugin

```typescript
// In plugins/index.ts
import { myExecutor } from './my-plugin/src/index';

export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  registry.registerWithMetadata('my-plugin', myExecutor, {
    nodeType: 'my-plugin',
    version: '1.0.0',
    category: 'custom',
    description: 'Does something awesome',
    requiredFields: ['input'],
    schema: MY_PLUGIN_SCHEMA,
    tags: ['transformation', 'data'],
    author: 'Your Team'
  });
}
```

### Pattern 2: Handling Unknown Node Types

```typescript
// In error-recovery.ts
async handleUnknownNodeType(
  nodeType: string,
  strategy: ErrorRecoveryStrategy
): Promise<NodeResult> {
  switch (strategy.strategy) {
    case 'fallback':
      return this.applyFallback(strategy.fallbackNodeType);

    case 'skip':
      return { status: 'skipped', output: {}, timestamp: Date.now() };

    case 'retry':
      return this.retryLoad(nodeType, strategy.maxRetries || 3);

    case 'fail':
    default:
      throw new UnknownNodeTypeError(nodeType);
  }
}
```

### Pattern 3: Multi-Tenant Check

```typescript
// In tenant-safety.ts
isNodeTypeAllowed(tenantId: string, nodeType: string): boolean {
  const policy = this.tenantPolicies.get(tenantId);

  if (!policy) return true;  // No policy = allow all

  // Whitelist takes precedence
  if (policy.allowedNodeTypes.length > 0) {
    return policy.allowedNodeTypes.includes(nodeType);
  }

  // Then check blacklist
  return !policy.restrictedNodeTypes.includes(nodeType);
}
```

### Pattern 4: Cache with Stats

```typescript
// In executor-cache.ts
get(key: string): INodeExecutor | undefined {
  const executor = this.cache.get(key);

  if (executor) {
    this.stats.hits++;
  } else {
    this.stats.misses++;
  }

  return executor;
}
```

---

## Testing Quick Reference

### Unit Test Template

```typescript
describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  describe('registerWithMetadata', () => {
    it('should register executor with metadata', () => {
      const executor = { nodeType: 'test', execute: jest.fn(), validate: jest.fn() };
      const metadata = { nodeType: 'test', version: '1.0.0', category: 'test' };

      registry.registerWithMetadata('test', executor, metadata);

      expect(registry.getPluginInfo('test')).toEqual(metadata);
    });

    it('should throw on invalid metadata', () => {
      const executor = { nodeType: 'test', execute: jest.fn(), validate: jest.fn() };
      const invalid = { version: '1.0.0' };  // Missing nodeType

      expect(() => registry.registerWithMetadata('test', executor, invalid as any))
        .toThrow('Invalid metadata');
    });
  });
});
```

### Integration Test Template

```typescript
describe('DAGExecutor with Registry', () => {
  let executor: DAGExecutor;
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
    executor = new DAGExecutor('exec-1', workflow, context, registry.execute.bind(registry));
  });

  it('should execute workflow with registry', async () => {
    const result = await executor.execute();

    expect(result.status).toBe('success');
    expect(registry.getStats().executionsTotal).toBeGreaterThan(0);
  });
});
```

---

## Performance Targets

| Operation | Target | Benchmark Method |
|---|---|---|
| Cache lookup (hit) | <0.1ms | 10,000 sequential lookups |
| Executor registration | <1ms | 100 sequential registrations |
| Node execution | <10ms (p95) | 1000 random node executions |
| Memory per executor | <50KB | Monitor heap size |
| Cache hit ratio | 95%+ | Track registry stats |

**Run benchmarks**:
```bash
npm run bench:registry
npm run bench:cache
npm run bench:execution
```

---

## Common Gotchas & Solutions

### Gotcha 1: Cache Invalidation

**Problem**: Cache contains stale executor after re-registration

**Solution**:
```typescript
registry.registerWithMetadata('node-type', executor, metadata);
registry.cache.invalidate('node-type');  // Clear cache entry
```

### Gotcha 2: Circular Dependencies

**Problem**: Plugin A depends on Plugin B which depends on Plugin A

**Solution**: Detect in `plugin-validator.ts`:
```typescript
validateDependencies(nodeType: string, registry: PluginRegistry): boolean {
  const visited = new Set<string>();
  return !this._hasCycle(nodeType, visited, registry);
}
```

### Gotcha 3: Multi-Tenant Data Leakage

**Problem**: Filter object gets modified in place, affecting other tenants

**Solution**: Always create new object:
```typescript
enforceDataIsolation(context, filter) {
  return { ...filter, tenantId: context.tenantId };  // Spread = new object
}
```

### Gotcha 4: Error Type Matching

**Problem**: Generic `Error` doesn't match specific error handlers

**Solution**: Use custom error classes:
```typescript
class TenantSecurityError extends Error { /* ... */ }
class UnknownNodeTypeError extends Error { /* ... */ }

// In catch block:
catch (error) {
  if (error instanceof TenantSecurityError) { /* ... */ }
  else if (error instanceof UnknownNodeTypeError) { /* ... */ }
}
```

### Gotcha 5: Async Plugin Loading

**Problem**: Plugin not ready when accessed

**Solution**: Use lazy loading with promise:
```typescript
private pluginPromise: Map<string, Promise<INodeExecutor>>;

async get(nodeType: string): Promise<INodeExecutor> {
  if (this.executors.has(nodeType)) {
    return this.executors.get(nodeType)!;
  }

  if (this.pluginPromise.has(nodeType)) {
    return await this.pluginPromise.get(nodeType)!;
  }

  throw new UnknownNodeTypeError(nodeType);
}
```

---

## Debugging Tips

### Enable Debug Logging

```bash
DEBUG=metabuilder:registry npm run dev
```

### Check Registry State

```typescript
// In browser console or debug statement
const registry = getNodeExecutorRegistry();
console.log('Executors:', registry.listExecutors());
console.log('Stats:', registry.getStats());
console.log('Cache:', registry.cache.stats());
```

### Profile Execution

```typescript
const startTime = performance.now();
await registry.execute(nodeType, node, context, state);
const duration = performance.now() - startTime;
console.log(`Execution took ${duration}ms`);
```

### Monitor Tenant Access

```typescript
const auditLog = registry.tenantManager.getAuditLog('tenant-1');
console.log('Access log:', auditLog);
```

---

## Dependencies & Versions

Required packages:
- TypeScript: ^4.9.0
- Node.js: ^18.0.0

No new external dependencies required.

---

## Related Documentation

- `PLUGIN_REGISTRY_IMPLEMENTATION_PLAN.md` - Complete detailed plan
- `/workflow/executor/ts/types.ts` - Type definitions
- `/workflow/executor/ts/registry/node-executor-registry.ts` - Current registry
- `/workflow/plugins/ts/dbal-read/src/index.ts` - Example plugin

---

## Getting Help

**Questions?**
- Check implementation plan Section 3 for file details
- Check Section 7 for testing examples
- Check Section 14 for risk mitigation

**Stuck?**
- Review the "Common Gotchas" section
- Check the "Key Code Patterns" section
- Reference example plugins in `workflow/plugins/ts/`

**Need Review?**
- Submit PR with tests
- Request code review from tech lead
- Include performance benchmarks
