# DBAL Quick Reference & Code Locations

**Purpose**: Fast lookup for DBAL architecture, file locations, and extension points

---

## Core Files Map

### Main Entry Points
```
/dbal/development/src/
├── index.ts                          # Public API exports
├── core/
│   ├── client.ts                     # DBALClient factory & re-exports
│   ├── client/
│   │   ├── client.ts                 # Main DBALClient class
│   │   ├── adapter-factory.ts        # Adapter composition logic ⭐
│   │   ├── builders.ts               # Entity operations builder
│   │   ├── factory.ts                # Client factory & singleton
│   │   └── mappers.ts                # Config normalization
│   ├── types.ts                      # Core type re-exports
│   └── entities/
│       ├── index.ts                  # Barrel exports
│       ├── operations/
│       │   ├── core/
│       │   │   ├── user-operations.ts
│       │   │   ├── workflow-operations.ts ⭐
│       │   │   └── session-operations.ts
│       │   └── system/
│       │       ├── page-operations.ts
│       │       ├── component-operations.ts
│       │       └── package-operations.ts
│       └── workflow/
│           ├── crud/                 # Workflow CRUD logic
│           │   ├── create-workflow.ts
│           │   ├── read-workflow.ts
│           │   ├── update-workflow.ts
│           │   ├── delete-workflow.ts
│           │   └── list-workflows.ts
│           ├── validation/
│           │   └── validate-workflow-create.ts
│           └── store/
│               └── in-memory-store.ts
```

### Adapters
```
/dbal/development/src/adapters/
├── adapter.ts                        # Base interface ⭐
├── adapter.ts.backup                 # Previous version
├── adapter-factory.ts                # (in core/client/)
├── prisma/
│   ├── index.ts                      # PrismaAdapter class
│   ├── context.ts                    # Prisma client context
│   ├── types.ts                      # Prisma-specific types
│   └── operations/
│       ├── crud.ts
│       ├── bulk.ts
│       ├── query.ts
│       └── capabilities.ts
├── memory/
│   └── index.ts                      # MemoryAdapter (in-memory store)
├── acl-adapter/                      # ACL wrapping adapter
│   ├── acl-adapter.ts                # ACLAdapter class
│   ├── context.ts
│   ├── crud.ts
│   ├── bulk.ts
│   ├── guards.ts
│   ├── read-strategy.ts
│   ├── write-strategy.ts
│   └── types.ts
└── acl/
    ├── default-rules.ts
    └── [rule definitions]
```

### Foundation Types & Validation
```
/dbal/development/src/core/foundation/
├── types/
│   ├── types.generated.ts            # All entity interfaces ⭐
│   ├── index.ts                      # Barrel export
│   ├── entities.ts                   # Type grouping
│   ├── operations.ts                 # OperationContext, OperationOptions
│   ├── events.ts
│   ├── auth/
│   ├── automation/
│   ├── content/
│   ├── packages/
│   ├── shared/
│   ├── system/
│   └── users/
├── validation/                       # Entity validation rules
│   ├── index.ts                      # Validation exports
│   ├── entities/
│   │   ├── user/
│   │   │   ├── validate-user-create.ts
│   │   │   └── validate-user-update.ts
│   │   ├── workflow/
│   │   │   ├── validate-workflow-create.ts ⭐
│   │   │   └── validate-workflow-update.ts
│   │   ├── page/
│   │   ├── component/
│   │   ├── session/
│   │   └── package/
│   └── predicates/                   # Validation helpers
│       ├── string/is-valid-json.ts
│       ├── string/is-valid-uuid.ts
│       └── [type predicates]
├── errors.ts                         # DBALError & error codes ⭐
├── tenant-context.ts
└── tenant/
    ├── tenant-types.ts               # TenantIdentity, TenantContext
    ├── permission-checks.ts          # canRead, canWrite, canDelete
    └── quota-checks.ts
```

### Workflow Engine
```
/dbal/development/src/workflow/
├── types.ts                          # WorkflowDefinition, WorkflowContext, etc ⭐
├── dag-executor.ts                   # DAGExecutor class ⭐
├── node-executor-registry.ts         # NodeExecutorRegistry & plugin system ⭐
├── priority-queue.ts                 # Task scheduling
└── executors/
    ├── ts/                           # TypeScript executor
    └── [other language executors]
```

### Runtime & Configuration
```
/dbal/development/src/runtime/
├── config.ts                         # DBALConfig interface ⭐
├── prisma-client.ts                  # Prisma client factory
└── [runtime initialization]
```

---

## Key Interfaces at a Glance

### DBALAdapter (All adapters implement this)
**File**: `/dbal/development/src/adapters/adapter.ts`

```typescript
export interface DBALAdapter {
  // CRUD
  create(entity: string, data: Record<string, unknown>): Promise<unknown>
  read(entity: string, id: string): Promise<unknown | null>
  update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown>
  delete(entity: string, id: string): Promise<boolean>
  list(entity: string, options?: ListOptions): Promise<ListResult<unknown>>

  // Query
  findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null>
  findByField(entity: string, field: string, value: unknown): Promise<unknown | null>

  // Bulk
  upsert(entity, uniqueField, uniqueValue, createData, updateData): Promise<unknown>
  updateByField(entity, field, value, data): Promise<unknown>
  deleteByField(entity, field, value): Promise<boolean>
  deleteMany(entity, filter?): Promise<number>
  createMany(entity, data): Promise<number>
  updateMany(entity, filter, data): Promise<number>

  // Meta
  getCapabilities(): Promise<AdapterCapabilities>
  close(): Promise<void>
}
```

### Workflow Entity
**File**: `/dbal/development/src/core/foundation/types/types.generated.ts`

```typescript
export interface Workflow {
  id: string
  tenantId?: string | null
  name: string
  description?: string
  nodes: string              // JSON
  edges: string              // JSON
  enabled: boolean
  version: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
}
```

### DBALConfig
**File**: `/dbal/development/src/runtime/config.ts`

```typescript
export interface DBALConfig {
  mode: 'development' | 'production'
  adapter: 'prisma' | 'sqlite' | 'mongodb' | 'postgres' | 'mysql' | 'memory'
  tenantId?: string
  endpoint?: string
  auth?: { user: User; session: Session }
  database?: { url?: string; options?: Record<string, unknown> }
  security?: { sandbox: 'strict' | 'permissive' | 'disabled'; enableAuditLog: boolean }
  performance?: { connectionPoolSize?: number; queryTimeout?: number }
}
```

### DBALError
**File**: `/dbal/development/src/core/foundation/errors.ts`

```typescript
export enum DBALErrorCode {
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNAUTHORIZED = 401,
  VALIDATION_ERROR = 422,
  SANDBOX_VIOLATION = 4031,
  MALICIOUS_CODE_DETECTED = 4032,
  // ... others
}

export class DBALError extends Error {
  code: DBALErrorCode
  details?: Record<string, unknown>

  static notFound(message)
  static conflict(message)
  static validationError(message, fields)
  static sandboxViolation(message)
  // ... others
}
```

### WorkflowDefinition
**File**: `/dbal/development/src/workflow/types.ts`

```typescript
export interface WorkflowDefinition {
  id: string
  name: string
  version: string
  tenantId: string
  active: boolean
  nodes: WorkflowNode[]
  connections: ConnectionMap
  triggers: WorkflowTrigger[]
  settings: WorkflowSettings
  multiTenancy: MultiTenancyPolicy
  errorHandling: ErrorHandlingPolicy
  retryPolicy: RetryPolicy
  // ... 20+ more fields
}

export interface WorkflowNode {
  id: string
  nodeType: string                    // Must match registered executor
  type: 'trigger' | 'operation' | 'action' | ...
  parameters: Record<string, any>
  disabled: boolean
  continueOnError: boolean
  // ... error handling, retry, timeout configs
}

export type BuiltInNodeType =
  | 'dbal-read'
  | 'dbal-write'
  | 'dbal-delete'
  | 'dbal-aggregate'
  | 'http-request'
  | 'condition'
  // ... others
```

### NodeExecutorRegistry
**File**: `/dbal/development/src/workflow/node-executor-registry.ts`

```typescript
export class NodeExecutorRegistry {
  register(nodeType: string, executor: INodeExecutor, plugin?: NodeExecutorPlugin): void
  registerBatch(executors: Array<{ nodeType; executor; plugin? }>): void
  get(nodeType: string): INodeExecutor | undefined
  has(nodeType: string): boolean
  listExecutors(): string[]
  listPlugins(): NodeExecutorPlugin[]
  async execute(nodeType, node, context, state): Promise<NodeResult>
  clear(): void
}

export function getNodeExecutorRegistry(): NodeExecutorRegistry
export function setNodeExecutorRegistry(registry: NodeExecutorRegistry): void
```

---

## Entity Operations Pattern

**All entity operations follow this structure:**

```typescript
export interface {EntityName}Operations {
  create: (data: Create{EntityName}Input) => Promise<{EntityName}>
  read: (id: string) => Promise<{EntityName} | null>
  update: (id: string, data: Update{EntityName}Input) => Promise<{EntityName}>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<{EntityName}>>
}

export const create{EntityName}Operations = (adapter: DBALAdapter, tenantId?: string): {EntityName}Operations => ({
  create: async data => {
    // 1. Resolve tenant ID
    // 2. Validate input
    // 3. Apply defaults
    // 4. Call adapter.create()
    // 5. Handle adapter errors
  },
  read: async id => {
    // 1. Resolve tenant ID
    // 2. Validate ID
    // 3. Call adapter.findFirst() with tenantId filter
    // 4. Check not found
  },
  // ... update, delete, list follow same pattern
})
```

**Examples**:
- User: `/dbal/development/src/core/entities/operations/core/user-operations.ts`
- Workflow: `/dbal/development/src/core/entities/operations/core/workflow-operations.ts` ⭐
- Session: `/dbal/development/src/core/entities/operations/core/session-operations.ts`

---

## Multi-Tenant Filtering

**Standard Pattern (used in all operations)**:

```typescript
// Resolve tenant ID from config or data
const resolveTenantId = (configuredTenantId?: string, data?: Partial<Entity>): string | null => {
  if (configuredTenantId && configuredTenantId.length > 0) return configuredTenantId
  const tenantId = data?.tenantId
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId
  return null
}

// Create filter with tenant ID
const resolveTenantFilter = (
  configuredTenantId: string | undefined,
  filter?: Record<string, unknown>,
): Record<string, unknown> | null => {
  if (configuredTenantId && configuredTenantId.length > 0) {
    return { ...(filter ?? {}), tenantId: configuredTenantId }
  }
  const candidate = filter?.tenantId ?? filter?.tenant_id
  if (typeof candidate === 'string' && candidate.length > 0) {
    return { ...(filter ?? {}), tenantId: candidate }
  }
  return null
}

// Usage in read
const result = await adapter.findFirst('Workflow', { id, tenantId: resolvedTenantId })

// Usage in list
return adapter.list('Workflow', { ...options, filter: tenantFilter })
```

---

## Adapter Composition Chain

```
DBALClient
  ↓
buildAdapter(config)
  ├─ Base Adapter Selection
  │  ├─ PrismaAdapter (primary)
  │  ├─ MemoryAdapter (testing)
  │  ├─ PostgresAdapter (alias for Prisma with postgres dialect)
  │  ├─ MySQLAdapter (alias for Prisma with mysql dialect)
  │  └─ WebSocketBridge (production remote)
  │
  ├─ Wrap with ValidationAdapter (optional, if security.enableWorkflowValidation)
  │
  └─ Wrap with ACLAdapter (if auth.user && security.sandbox !== 'disabled')
       ├─ Read Strategy
       └─ Write Strategy
```

---

## Error Code Reference

**File**: `/dbal/development/src/core/foundation/errors.ts`

| Code | HTTP | Usage |
|------|------|-------|
| `NOT_FOUND` | 404 | Record doesn't exist |
| `CONFLICT` | 409 | Unique constraint violation |
| `UNAUTHORIZED` | 401 | Missing/invalid auth |
| `FORBIDDEN` | 403 | Authenticated but no permission |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `TIMEOUT` | 504 | Operation took too long |
| `DATABASE_ERROR` | 503 | Database unavailable |
| `CAPABILITY_NOT_SUPPORTED` | 501 | Adapter doesn't support feature |
| `SANDBOX_VIOLATION` | 4031 | ACL detected violation |
| `MALICIOUS_CODE_DETECTED` | 4032 | Suspicious activity detected |
| `QUOTA_EXCEEDED` | 507 | Storage/record limit reached |
| `PERMISSION_DENIED` | 4033 | ACL denied operation |

---

## Validation Pattern

**File**: `/dbal/development/src/core/validation/entities/workflow/`

```typescript
// validation function returns array of error strings
export function validateWorkflowCreate(data: Partial<Workflow>): string[] {
  const errors: string[] = []

  if (!data.name) {
    errors.push('name is required')
  } else if (typeof data.name !== 'string' || data.name.length > 255) {
    errors.push('name must be 1-255 characters')
  }

  if (!data.nodes) {
    errors.push('nodes is required')
  } else if (typeof data.nodes !== 'string' || !isValidJsonString(data.nodes)) {
    errors.push('nodes must be a JSON string')
  }

  // ... more checks

  return errors
}

// Used in operations
const errors = validateWorkflowCreate(payload)
if (errors.length > 0) {
  throw DBALError.validationError('Invalid workflow data',
    errors.map(error => ({ field: 'workflow', error })))
}
```

---

## Extension Point: Adding Workflow Validation Adapter

### 1. Create Validation Adapter Class

**Location**: `/dbal/development/src/adapters/validation-adapter/`

```typescript
// validation-adapter.ts
export class ValidationAdapter implements DBALAdapter {
  constructor(
    private baseAdapter: DBALAdapter,
    private registry: WorkflowValidationRegistry
  ) {}

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    if (entity === 'Workflow') {
      const result = await this.registry.validate(data as Workflow)
      if (!result.valid) {
        throw DBALError.validationError('Workflow validation failed',
          result.errors.map(e => ({ field: 'workflow', error: e })))
      }
    }
    return this.baseAdapter.create(entity, data)
  }

  // Delegate all other methods...
  async read(entity: string, id: string) { return this.baseAdapter.read(entity, id) }
  async update(entity: string, id: string, data: Record<string, unknown>) {
    if (entity === 'Workflow') {
      const current = await this.baseAdapter.read(entity, id)
      const merged = { ...current, ...data }
      const result = await this.registry.validate(merged as Workflow)
      if (!result.valid) {
        throw DBALError.validationError('Workflow validation failed',
          result.errors.map(e => ({ field: 'workflow', error: e })))
      }
    }
    return this.baseAdapter.update(entity, id, data)
  }
  async delete(entity: string, id: string) { return this.baseAdapter.delete(entity, id) }
  // ... rest of methods
}
```

### 2. Register Adapter in Factory

**Location**: `/dbal/development/src/core/client/adapter-factory.ts`

```typescript
export const createAdapter = (config: DBALConfig): DBALAdapter => {
  let baseAdapter: DBALAdapter = createBaseAdapter(config)

  // Add validation if enabled
  if (config.security?.enableWorkflowValidation) {
    const registry = getWorkflowValidationRegistry()
    baseAdapter = new ValidationAdapter(baseAdapter, registry)
  }

  // Add ACL if authenticated
  if (config.auth?.user && config.security?.sandbox !== 'disabled') {
    return new ACLAdapter(baseAdapter, config.auth.user, { ... })
  }

  return baseAdapter
}
```

### 3. Create Validation Registry

**Location**: `/dbal/development/src/workflow/validation-registry.ts`

```typescript
export interface WorkflowValidationRule {
  id: string
  name: string
  category: 'node-type' | 'connection' | 'structure' | 'security' | 'performance'
  severity: 'error' | 'warning'
  enabled: boolean
  validate(workflow: Workflow): ValidationError[]
}

export class WorkflowValidationRegistry {
  private rules: Map<string, WorkflowValidationRule> = new Map()

  registerRule(rule: WorkflowValidationRule): void {
    this.rules.set(rule.id, rule)
  }

  async validate(workflow: Workflow): Promise<WorkflowValidationResult> {
    // Iterate rules, collect errors/warnings
  }
}

export function getWorkflowValidationRegistry(): WorkflowValidationRegistry {
  if (!globalRegistry) {
    globalRegistry = new WorkflowValidationRegistry()
    registerDefaultRules(globalRegistry)
  }
  return globalRegistry
}
```

---

## Testing Helpers

### Memory Adapter for Testing

```typescript
import { MemoryAdapter } from '@/dbal/adapters/memory'
import { DBALClient } from '@/dbal'

const client = new DBALClient({
  mode: 'development',
  adapter: 'memory',
  tenantId: 'test-tenant'
})

// Use like normal DBAL client
const workflow = await client.workflows.create({
  name: 'Test Workflow',
  nodes: '[]',
  edges: '[]',
  enabled: true
})
```

### Validation in Tests

```typescript
import { validateWorkflowCreate } from '@/dbal/core/validation'

const errors = validateWorkflowCreate({
  name: 'My Workflow',
  nodes: '[{"id":"n1"}]',
  edges: '[]',
  enabled: true
})

expect(errors).toHaveLength(0)
```

---

## Common Queries

### Get all supported node types
```typescript
const registry = getNodeExecutorRegistry()
const nodeTypes = registry.listExecutors()
```

### Check if node type is supported
```typescript
const registry = getNodeExecutorRegistry()
const supported = registry.has('dbal-read')
```

### List all validation rules
```typescript
const registry = getWorkflowValidationRegistry()
// Access rules via internal map or add public method
```

### Multi-tenant workflows
```typescript
// Client created with tenant
const client = new DBALClient({
  tenantId: 'acme-corp',
  // ... other config
})

// All queries automatically filtered
const workflows = await client.workflows.list()  // Only acme-corp's workflows
```

---

## Related Documentation

- **Full Architecture**: `DBAL_ARCHITECTURE_ANALYSIS.md`
- **Workflow Types**: `/dbal/development/src/workflow/types.ts`
- **Entity Types**: `/dbal/development/src/core/foundation/types/types.generated.ts`
- **Workflow Editor**: `/codegen/` (uses DBAL for persistence)
- **Workflow Executor**: `/workflow/executor/`
