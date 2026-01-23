# DBAL Integration Guide for Workflow Validation

**Purpose**: Step-by-step guide to integrate workflow validation registry with DBAL

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                            DBALClient                                 │
│  client.workflows.create(data) → buildEntityOperations()            │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      buildEntityOperations()           │
        │  ├─ createUserOperations()            │
        │  ├─ createWorkflowOperations() ◄──┐   │
        │  └─ ... other operations           │   │
        └───────────┬───────────────────────────┘
                    │                            │
                    ▼                            │
    ┌────────────────────────────────────┐     │
    │  WorkflowOperations (factory)       │     │
    │  ├─ create()                        ├─────┘
    │  ├─ read()                          │
    │  ├─ update()                        │
    │  ├─ list()                          │
    │  └─ delete()                        │
    └────────────┬─────────────────────────┘
                 │ (data validated, defaults applied)
                 ▼
    ┌────────────────────────────────────┐
    │    Adapter Chain (from factory)     │ ◄── NEW: ValidationAdapter can wrap here
    │                                     │
    │  [BaseAdapter]                      │
    │  ├─ PrismaAdapter                   │
    │  ├─ MemoryAdapter                   │
    │  └─ PostgresAdapter, MySQLAdapter   │
    │           │                         │
    │           ▼                         │
    │  [Optional] ValidationAdapter ◄─────┼─ NEW EXTENSION POINT
    │    ├─ Intercepts create/update      │
    │    ├─ Validates workflow            │
    │    └─ Delegates to baseAdapter      │
    │           │                         │
    │           ▼                         │
    │  [Optional] ACLAdapter              │
    │    ├─ Checks permissions            │
    │    ├─ Enforces multi-tenancy        │
    │    └─ Delegates to baseAdapter      │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │   Database                          │
    │  ├─ PostgreSQL                      │
    │  ├─ MySQL                           │
    │  └─ Memory (testing)                │
    └────────────────────────────────────┘
```

---

## Workflow Validation Process

```
create(workflow)
  │
  ├─ 1. Entity Operations Layer
  │  ├─ resolveTenantId()
  │  ├─ withWorkflowDefaults()
  │  └─ validateWorkflowCreate() ◄─ Basic field validation
  │
  ├─ 2. ValidationAdapter (NEW)
  │  ├─ Check if entity === 'Workflow'
  │  ├─ Call registry.validate(workflow)
  │  │  ├─ Apply rule: valid-node-types
  │  │  ├─ Apply rule: valid-connections
  │  │  ├─ Apply rule: multi-tenant-safety
  │  │  └─ Collect errors/warnings
  │  │
  │  └─ If errors, throw DBALError.validationError()
  │
  ├─ 3. ACLAdapter (if enabled)
  │  ├─ Check canWrite('Workflow')
  │  └─ Log audit trail
  │
  └─ 4. BaseAdapter
     └─ Persist to database
```

---

## Implementation Steps

### Step 1: Create Validation Adapter

**File**: `/dbal/development/src/adapters/validation-adapter/validation-adapter.ts`

```typescript
/**
 * @file validation-adapter.ts
 * @description Adapter that validates workflows before persistence
 *
 * Composition pattern: wraps any DBALAdapter
 * Intercepts Workflow entity create/update to validate against registry
 */

import type { DBALAdapter, AdapterCapabilities } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import { DBALError } from '../../core/foundation/errors'
import type { Workflow } from '../../core/foundation/types'
import { getWorkflowValidationRegistry } from '../../workflow/validation-registry'

/**
 * Validation adapter that wraps any base adapter
 * Validates workflows before delegating to base adapter
 */
export class ValidationAdapter implements DBALAdapter {
  constructor(private baseAdapter: DBALAdapter) {}

  /**
   * Validate and create entity
   */
  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    if (entity === 'Workflow') {
      await this.validateWorkflow(data as Workflow)
    }
    return this.baseAdapter.create(entity, data)
  }

  /**
   * Validate and update entity
   */
  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    if (entity === 'Workflow') {
      // Fetch current to get full workflow for validation
      const current = await this.baseAdapter.read(entity, id)
      if (!current) {
        throw DBALError.notFound(`Workflow not found: ${id}`)
      }
      // Merge and validate
      const merged = { ...current, ...data } as Workflow
      await this.validateWorkflow(merged)
    }
    return this.baseAdapter.update(entity, id, data)
  }

  /**
   * Validate workflow against registry
   */
  private async validateWorkflow(workflow: Record<string, unknown>): Promise<void> {
    const registry = getWorkflowValidationRegistry()
    const result = await registry.validate(workflow as Workflow)

    if (!result.valid) {
      throw DBALError.validationError(
        'Workflow validation failed',
        result.errors.map(error => ({
          field: 'workflow',
          error
        }))
      )
    }

    // Log warnings to console
    if (result.warnings.length > 0) {
      console.warn('Workflow validation warnings:', result.warnings)
    }
  }

  // Delegate all other methods to baseAdapter

  async read(entity: string, id: string): Promise<unknown | null> {
    return this.baseAdapter.read(entity, id)
  }

  async delete(entity: string, id: string): Promise<boolean> {
    return this.baseAdapter.delete(entity, id)
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    return this.baseAdapter.list(entity, options)
  }

  async findFirst(
    entity: string,
    filter?: Record<string, unknown>
  ): Promise<unknown | null> {
    return this.baseAdapter.findFirst(entity, filter)
  }

  async findByField(
    entity: string,
    field: string,
    value: unknown
  ): Promise<unknown | null> {
    return this.baseAdapter.findByField(entity, field, value)
  }

  async upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<unknown> {
    return this.baseAdapter.upsert(entity, uniqueField, uniqueValue, createData, updateData)
  }

  async updateByField(
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return this.baseAdapter.updateByField(entity, field, value, data)
  }

  async deleteByField(
    entity: string,
    field: string,
    value: unknown
  ): Promise<boolean> {
    return this.baseAdapter.deleteByField(entity, field, value)
  }

  async deleteMany(
    entity: string,
    filter?: Record<string, unknown>
  ): Promise<number> {
    return this.baseAdapter.deleteMany(entity, filter)
  }

  async createMany(
    entity: string,
    data: Record<string, unknown>[]
  ): Promise<number> {
    return this.baseAdapter.createMany(entity, data)
  }

  async updateMany(
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number> {
    return this.baseAdapter.updateMany(entity, filter, data)
  }

  async getCapabilities(): Promise<AdapterCapabilities> {
    return this.baseAdapter.getCapabilities()
  }

  async close(): Promise<void> {
    return this.baseAdapter.close()
  }
}

export { ValidationAdapter }
```

### Step 2: Create Validation Registry

**File**: `/dbal/development/src/workflow/validation-registry.ts`

```typescript
/**
 * @file validation-registry.ts
 * @description Workflow validation rule registry and validator
 *
 * Manages collection of validation rules that workflows must pass
 * Rules are organized by category and severity (error/warning)
 */

import { getNodeExecutorRegistry } from './node-executor-registry'
import type { Workflow } from '../core/foundation/types'

export interface ValidationError {
  message: string
  nodeId?: string
  field?: string
}

export interface WorkflowValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  ruleResults: Map<string, ValidationError[]>
}

export interface WorkflowValidationRule {
  id: string
  name: string
  category: 'node-type' | 'connection' | 'structure' | 'security' | 'performance'
  description: string
  severity: 'error' | 'warning'
  enabled: boolean
  validate(workflow: Workflow): ValidationError[]
}

/**
 * Registry of workflow validation rules
 */
export class WorkflowValidationRegistry {
  private rules: Map<string, WorkflowValidationRule> = new Map()

  /**
   * Register a validation rule
   */
  registerRule(rule: WorkflowValidationRule): void {
    this.rules.set(rule.id, rule)
    console.debug(`Registered validation rule: ${rule.id}`)
  }

  /**
   * Register multiple rules at once
   */
  registerRules(rules: WorkflowValidationRule[]): void {
    rules.forEach(rule => this.registerRule(rule))
  }

  /**
   * Get a specific rule
   */
  getRule(id: string): WorkflowValidationRule | undefined {
    return this.rules.get(id)
  }

  /**
   * List all registered rules
   */
  listRules(): WorkflowValidationRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(id: string, enabled: boolean): void {
    const rule = this.rules.get(id)
    if (rule) {
      rule.enabled = enabled
    }
  }

  /**
   * Validate a workflow against all enabled rules
   */
  async validate(workflow: Workflow): Promise<WorkflowValidationResult> {
    const result: WorkflowValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      ruleResults: new Map()
    }

    // Apply each enabled rule
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      try {
        const ruleErrors = rule.validate(workflow)
        result.ruleResults.set(rule.id, ruleErrors)

        if (ruleErrors.length > 0) {
          const messages = ruleErrors.map(e => e.message)

          if (rule.severity === 'error') {
            result.valid = false
            result.errors.push(...messages)
          } else {
            result.warnings.push(...messages)
          }
        }
      } catch (error) {
        // Catch rule execution errors
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Rule execution error (${rule.id}): ${message}`)
        result.valid = false
        result.errors.push(`Rule execution error: ${rule.id}`)
      }
    }

    return result
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.rules.clear()
  }
}

/**
 * Global registry singleton
 */
let globalRegistry: WorkflowValidationRegistry | null = null

export function getWorkflowValidationRegistry(): WorkflowValidationRegistry {
  if (!globalRegistry) {
    globalRegistry = new WorkflowValidationRegistry()
    registerDefaultRules(globalRegistry)
  }
  return globalRegistry
}

export function setWorkflowValidationRegistry(registry: WorkflowValidationRegistry): void {
  globalRegistry = registry
}

/**
 * Register built-in validation rules
 */
function registerDefaultRules(registry: WorkflowValidationRegistry): void {
  // Rule 1: Valid node types
  registry.registerRule({
    id: 'valid-node-types',
    name: 'Valid Node Types',
    category: 'node-type',
    description: 'All nodes must have registered executors',
    severity: 'error',
    enabled: true,
    validate: (workflow: Workflow): ValidationError[] => {
      const executorRegistry = getNodeExecutorRegistry()
      const errors: ValidationError[] = []

      for (const node of workflow.nodes) {
        if (!executorRegistry.has(node.nodeType)) {
          errors.push({
            message: `No executor registered for node type: ${node.nodeType}`,
            nodeId: node.id
          })
        }
      }

      return errors
    }
  })

  // Rule 2: Valid connections
  registry.registerRule({
    id: 'valid-connections',
    name: 'Valid Connections',
    category: 'connection',
    description: 'All connections must reference existing nodes',
    severity: 'error',
    enabled: true,
    validate: (workflow: Workflow): ValidationError[] => {
      const nodeIds = new Set(workflow.nodes.map(n => n.id))
      const errors: ValidationError[] = []

      // Check connections
      for (const [fromNodeId, outputs] of Object.entries(workflow.connections)) {
        if (!nodeIds.has(fromNodeId)) {
          errors.push({
            message: `Connection from non-existent node: ${fromNodeId}`
          })
          continue
        }

        // Check all targets
        for (const portOutputs of Object.values(outputs)) {
          for (const targetList of Object.values(portOutputs)) {
            for (const target of targetList) {
              if (!nodeIds.has(target.node)) {
                errors.push({
                  message: `Connection from node '${fromNodeId}' to non-existent node: ${target.node}`,
                  nodeId: fromNodeId
                })
              }
            }
          }
        }
      }

      return errors
    }
  })

  // Rule 3: Multi-tenancy safety
  registry.registerRule({
    id: 'multi-tenant-safety',
    name: 'Multi-Tenant Safety',
    category: 'security',
    description: 'DBAL nodes must be configured for multi-tenant environments',
    severity: 'error',
    enabled: true,
    validate: (workflow: Workflow): ValidationError[] => {
      // Only check if multi-tenancy is enforced
      if (!workflow.multiTenancy?.enforced) {
        return []
      }

      const errors: ValidationError[] = []
      const dbalNodes = workflow.nodes.filter(n =>
        n.nodeType.startsWith('dbal-')
      )

      const tenantIdField = workflow.multiTenancy.tenantIdField || 'tenantId'

      for (const node of dbalNodes) {
        // Check if node has tenantId parameter configured
        if (!node.parameters[tenantIdField]) {
          errors.push({
            message: `DBAL node '${node.id}' missing required '${tenantIdField}' parameter`,
            nodeId: node.id,
            field: tenantIdField
          })
        }
      }

      return errors
    }
  })

  // Rule 4: Node configuration
  registry.registerRule({
    id: 'node-configuration',
    name: 'Node Configuration',
    category: 'structure',
    description: 'All nodes must have required configuration',
    severity: 'error',
    enabled: true,
    validate: (workflow: Workflow): ValidationError[] => {
      const errors: ValidationError[] = []

      for (const node of workflow.nodes) {
        // Check required fields
        if (!node.id) {
          errors.push({ message: 'Node missing id field' })
        }
        if (!node.name) {
          errors.push({ message: `Node '${node.id}' missing name field`, nodeId: node.id })
        }
        if (!node.nodeType) {
          errors.push({
            message: `Node '${node.id}' missing nodeType field`,
            nodeId: node.id
          })
        }

        // Check position for UI
        if (!node.position || node.position.length !== 2) {
          console.warn(`Node '${node.id}' missing or invalid position`)
        }
      }

      return errors
    }
  })

  // Rule 5: Performance checks
  registry.registerRule({
    id: 'performance-checks',
    name: 'Performance Checks',
    category: 'performance',
    description: 'Check for potential performance issues',
    severity: 'warning',
    enabled: true,
    validate: (workflow: Workflow): ValidationError[] => {
      const errors: ValidationError[] = []

      // Too many nodes?
      if (workflow.nodes.length > 100) {
        errors.push({
          message: `Workflow has ${workflow.nodes.length} nodes (consider breaking into sub-workflows)`
        })
      }

      // Deep nesting?
      const depths = calculateNodeDepths(workflow)
      const maxDepth = Math.max(...depths.values())
      if (maxDepth > 20) {
        errors.push({
          message: `Workflow has nesting depth of ${maxDepth} (may impact performance)`
        })
      }

      return errors
    }
  })
}

/**
 * Helper: Calculate nesting depth of nodes in workflow
 */
function calculateNodeDepths(workflow: Workflow): Map<string, number> {
  const depths = new Map<string, number>()
  const visited = new Set<string>()

  function dfs(nodeId: string, depth: number): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    depths.set(nodeId, depth)

    // Find connected nodes
    const outputs = workflow.connections[nodeId]
    if (outputs) {
      for (const portOutputs of Object.values(outputs)) {
        for (const targetList of Object.values(portOutputs)) {
          for (const target of targetList) {
            dfs(target.node, depth + 1)
          }
        }
      }
    }
  }

  // Start from nodes with no inputs
  const hasInputs = new Set<string>()
  for (const targets of Object.values(workflow.connections)) {
    for (const portOutputs of Object.values(targets)) {
      for (const targetList of Object.values(portOutputs)) {
        for (const target of targetList) {
          hasInputs.add(target.node)
        }
      }
    }
  }

  for (const node of workflow.nodes) {
    if (!hasInputs.has(node.id)) {
      dfs(node.id, 0)
    }
  }

  return depths
}
```

### Step 3: Update Adapter Factory

**File**: `/dbal/development/src/core/client/adapter-factory.ts`

```typescript
/**
 * UPDATE: Add ValidationAdapter import and integration
 */

import type { DBALConfig } from '../../runtime/config'
import type { DBALAdapter } from '../../adapters/adapter'
import { DBALError } from '../foundation/errors'
import { PrismaAdapter, PostgresAdapter, MySQLAdapter } from '../../adapters/prisma'
import { MemoryAdapter } from '../../adapters/memory'
import { ValidationAdapter } from '../../adapters/validation-adapter' // NEW
import { ACLAdapter } from '../../adapters/acl-adapter'
import { WebSocketBridge } from '../../bridges/websocket-bridge'

/**
 * Creates the appropriate DBAL adapter based on configuration
 */
export const createAdapter = (config: DBALConfig): DBALAdapter => {
  let baseAdapter: DBALAdapter

  if (config.mode === 'production' && config.endpoint) {
    baseAdapter = new WebSocketBridge(config.endpoint, config.auth)
  } else {
    switch (config.adapter) {
      case 'prisma':
        baseAdapter = new PrismaAdapter(
          config.database?.url,
          config.performance?.queryTimeout ? { queryTimeout: config.performance.queryTimeout } : undefined
        )
        break
      case 'memory':
        baseAdapter = new MemoryAdapter()
        break
      case 'postgres':
        baseAdapter = new PostgresAdapter(
          config.database?.url,
          config.performance?.queryTimeout ? { queryTimeout: config.performance.queryTimeout } : undefined
        )
        break
      case 'mysql':
        baseAdapter = new MySQLAdapter(
          config.database?.url,
          config.performance?.queryTimeout ? { queryTimeout: config.performance.queryTimeout } : undefined
        )
        break
      case 'sqlite':
        throw new Error('SQLite adapter to be implemented in Phase 3')
      case 'mongodb':
        throw new Error('MongoDB adapter to be implemented in Phase 3')
      default:
        throw DBALError.internal('Unknown adapter type')
    }
  }

  // NEW: Wrap with validation adapter if workflow validation is enabled
  if (config.security?.enableWorkflowValidation) {
    baseAdapter = new ValidationAdapter(baseAdapter)
  }

  // Wrap with ACL if user auth provided
  if (config.auth?.user && config.security?.sandbox !== 'disabled') {
    return new ACLAdapter(
      baseAdapter,
      config.auth.user,
      {
        auditLog: config.security?.enableAuditLog ?? true
      }
    )
  }

  return baseAdapter
}
```

### Step 4: Update Config to Support Validation

**File**: `/dbal/development/src/runtime/config.ts` (optional enhancement)

```typescript
export interface DBALConfig {
  mode: 'development' | 'production'
  adapter: 'prisma' | 'sqlite' | 'mongodb' | 'postgres' | 'mysql' | 'memory'
  tenantId?: string
  endpoint?: string
  auth?: {
    user: User
    session: Session
  }
  database?: {
    url?: string
    options?: Record<string, unknown>
  }
  security?: {
    sandbox: 'strict' | 'permissive' | 'disabled'
    enableAuditLog: boolean
    enableWorkflowValidation?: boolean  // NEW: Enable workflow validation
  }
  performance?: {
    connectionPoolSize?: number
    queryTimeout?: number
  }
}
```

### Step 5: Create Tests

**File**: `/dbal/development/src/adapters/validation-adapter/__tests__/validation-adapter.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryAdapter } from '../../memory'
import { ValidationAdapter } from '../validation-adapter'
import { getWorkflowValidationRegistry } from '../../../workflow/validation-registry'
import { DBALError } from '../../../core/foundation/errors'

describe('ValidationAdapter', () => {
  let adapter: ValidationAdapter
  let memoryAdapter: MemoryAdapter

  beforeEach(() => {
    memoryAdapter = new MemoryAdapter()
    adapter = new ValidationAdapter(memoryAdapter)
  })

  describe('workflow validation', () => {
    it('should allow valid workflows', async () => {
      const validWorkflow = {
        id: 'wf-1',
        tenantId: 'tenant-1',
        name: 'Test Workflow',
        description: 'A test workflow',
        nodes: JSON.stringify([
          {
            id: 'n1',
            nodeType: 'http-request',
            name: 'Test Node',
            type: 'operation'
          }
        ]),
        edges: JSON.stringify([]),
        enabled: true,
        version: 1,
        multiTenancy: { enforced: false }
      }

      const result = await adapter.create('Workflow', validWorkflow)
      expect(result).toBeDefined()
    })

    it('should reject workflows with invalid node types', async () => {
      const invalidWorkflow = {
        id: 'wf-2',
        tenantId: 'tenant-1',
        name: 'Invalid Workflow',
        nodes: JSON.stringify([
          {
            id: 'n1',
            nodeType: 'non-existent-type',
            name: 'Invalid Node',
            type: 'operation'
          }
        ]),
        edges: JSON.stringify([]),
        enabled: true,
        version: 1,
        multiTenancy: { enforced: false }
      }

      await expect(adapter.create('Workflow', invalidWorkflow)).rejects.toThrow(
        'Workflow validation failed'
      )
    })

    it('should reject workflows with invalid connections', async () => {
      const invalidWorkflow = {
        id: 'wf-3',
        tenantId: 'tenant-1',
        name: 'Invalid Connections',
        nodes: JSON.stringify([
          {
            id: 'n1',
            nodeType: 'http-request',
            name: 'Node 1',
            type: 'operation'
          }
        ]),
        edges: JSON.stringify([]),
        enabled: true,
        version: 1,
        connections: {
          'n1': {
            output: {
              0: [{ node: 'non-existent-node', type: 'main', index: 0 }]
            }
          }
        },
        multiTenancy: { enforced: false }
      }

      await expect(adapter.create('Workflow', invalidWorkflow)).rejects.toThrow(
        'Workflow validation failed'
      )
    })
  })

  describe('non-workflow entities', () => {
    it('should pass through non-workflow entities', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user' as const,
        createdAt: BigInt(Date.now()),
        isInstanceOwner: false,
        firstLogin: true
      }

      const result = await adapter.create('User', user)
      expect(result).toBeDefined()
    })
  })
})
```

---

## Usage Example

```typescript
import { createDBALClient } from '@/dbal'

// Create client with validation enabled
const client = createDBALClient({
  mode: 'development',
  adapter: 'memory',
  tenantId: 'acme-corp',
  security: {
    sandbox: 'strict',
    enableAuditLog: true,
    enableWorkflowValidation: true  // Enable validation
  }
})

try {
  // Valid workflow
  const workflow = await client.workflows.create({
    name: 'My Workflow',
    nodes: JSON.stringify([
      {
        id: 'n1',
        nodeType: 'http-request',  // Must be registered
        name: 'HTTP Request',
        type: 'operation'
      }
    ]),
    edges: JSON.stringify([]),
    enabled: true
  })

  // Invalid workflow - will be rejected
  await client.workflows.create({
    name: 'Bad Workflow',
    nodes: JSON.stringify([
      {
        id: 'n1',
        nodeType: 'invalid-type',  // Not registered - validation error
        name: 'Invalid',
        type: 'operation'
      }
    ]),
    edges: JSON.stringify([]),
    enabled: true
  })
} catch (error) {
  if (error instanceof DBALError) {
    console.error('Workflow validation failed:', error.message)
    console.error('Details:', error.details)
  }
}
```

---

## Integration Checklist

- [ ] Create `/dbal/development/src/adapters/validation-adapter/` directory
- [ ] Implement `ValidationAdapter` class
- [ ] Create `/dbal/development/src/workflow/validation-registry.ts`
- [ ] Update `/dbal/development/src/core/client/adapter-factory.ts` with ValidationAdapter
- [ ] Add `enableWorkflowValidation` config option (optional)
- [ ] Export new classes in appropriate `index.ts` files
- [ ] Write unit tests for ValidationAdapter
- [ ] Write integration tests with real workflows
- [ ] Test with multi-tenant workflows
- [ ] Document in `/dbal/development/README.md`
- [ ] Update DBAL client exports if needed

---

## Performance Considerations

### Validation Overhead
- **Synchronous validation**: ~1-5ms per workflow (varies by rule complexity)
- **No database impact**: Validation happens before persistence
- **Rule execution**: Sequential, can be optimized with parallel execution if needed

### Optimization Options

1. **Lazy rule evaluation**:
   ```typescript
   // Only run expensive rules on first creation
   const shouldRunExpensiveRules = !workflow.id  // New workflow
   ```

2. **Caching**:
   ```typescript
   // Cache validation result keyed by workflow ID + version
   private validationCache = new Map<string, WorkflowValidationResult>()
   ```

3. **Async rules** (future):
   ```typescript
   // For rules that need database queries
   async validate(workflow: Workflow): Promise<ValidationError[]>
   ```

---

## Testing Strategy

### Unit Tests
- ValidationAdapter delegates correctly
- Registry registers/retrieves rules
- Individual rule validation logic

### Integration Tests
- End-to-end with MemoryAdapter
- Multi-tenant workflow validation
- ACL + Validation composition
- Error propagation through layers

### Performance Tests
- Benchmark validation time vs workflow size
- Profile memory usage with large rule sets

---

## References

- Architecture: `DBAL_ARCHITECTURE_ANALYSIS.md`
- Quick Reference: `DBAL_QUICK_REFERENCE.md`
- Adapter Pattern: See `/dbal/development/src/adapters/`
- Workflow Types: `/dbal/development/src/workflow/types.ts`
