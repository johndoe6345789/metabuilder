# DBAL Workflow Extension Specification

**Document Version**: 1.0
**Date**: 2026-01-22
**Status**: Architecture & Design Phase
**Author**: Claude Code
**Phase**: DBAL Phase 2 (TypeScript Development)

---

## Executive Summary

This specification defines the extension of the DBAL (Database Abstraction Layer) to comprehensively support workflow operations with guaranteed multi-tenant isolation. The extension maintains architectural consistency with existing entity operations (User, Package, Page) while introducing workflow-specific optimizations for DAG persistence, execution caching, and validator integration.

**Key Design Principles**:
- **Multi-tenant as a first-class concern**: Every query automatically filters by `tenantId`
- **Type safety through composition**: Leverage existing DBAL patterns (Adapter → ACL Adapter → Entity Operations)
- **Validator integration**: Tight coupling with WorkflowValidator for compliance guarantees
- **Performance optimization**: Multi-level caching strategy (hot cache, warm cache, cold cache)
- **Error handling**: Consistent DBALError codes with workflow-specific context

---

## 1. Workflow Entity Schema

### 1.1 Extended YAML Entity Definition

**Location**: `dbal/shared/api/schema/entities/core/workflow.yaml`

```yaml
entity: Workflow
version: "2.0"
description: "Workflow definitions with enhanced metadata for DAG execution and multi-tenant isolation"

fields:
  # === Primary Keys & Identification ===
  id:
    type: uuid
    primary: true
    generated: true
    description: "Unique workflow identifier"

  tenantId:
    type: uuid
    required: true
    nullable: false
    index: true
    description: "Tenant isolation - MANDATORY for multi-tenant safety"

  # === Core Workflow Definition ===
  name:
    type: string
    required: true
    max_length: 255
    min_length: 1
    description: "Human-readable workflow name"

  description:
    type: text
    optional: true
    nullable: true
    description: "Detailed workflow description"

  # === DAG Structure (JSON) ===
  nodes:
    type: json
    required: true
    description: "Workflow nodes array - validated against WorkflowNode schema"
    schema_ref: "WorkflowNode[]"

  edges:
    type: json
    required: true
    description: "Workflow connections - validated against connections schema"
    schema_ref: "WorkflowConnections"

  # === Workflow State ===
  enabled:
    type: boolean
    required: true
    default: true
    index: true
    description: "Enable/disable workflow execution"

  version:
    type: integer
    required: true
    default: 1
    description: "Semantic version for workflow definition"

  # === Execution Metadata ===
  lastExecutedAt:
    type: bigint
    optional: true
    nullable: true
    index: true
    description: "Timestamp of last execution (ms)"

  executionCount:
    type: integer
    required: true
    default: 0
    description: "Total execution invocations"

  lastExecutionStatus:
    type: enum
    values: [success, failure, pending, timeout]
    optional: true
    nullable: true
    description: "Status of most recent execution"

  averageExecutionTime:
    type: integer
    optional: true
    nullable: true
    description: "Average execution duration (ms)"

  # === Audit Trail ===
  createdAt:
    type: bigint
    generated: true
    description: "Creation timestamp (ms)"

  updatedAt:
    type: bigint
    generated: true
    description: "Last modification timestamp (ms)"

  createdBy:
    type: uuid
    required: true
    foreign_key:
      entity: User
      field: id
    description: "Creator user ID"

  updatedBy:
    type: uuid
    optional: true
    nullable: true
    foreign_key:
      entity: User
      field: id
    description: "Last modifier user ID"

  # === Workflow Configuration ===
  variables:
    type: json
    optional: true
    nullable: true
    description: "Workflow-scoped variables with type definitions"
    schema_ref: "WorkflowVariables"

  config:
    type: json
    optional: true
    nullable: true
    description: "Advanced execution configuration (timeout, retries, etc.)"
    schema_ref: "WorkflowExecutionConfig"

  # === Tags & Categorization ===
  tags:
    type: string
    optional: true
    nullable: true
    description: "Comma-separated tags for filtering and organization"

  category:
    type: enum
    values: [system, user, package, automation, integration, template]
    optional: true
    nullable: true
    description: "Workflow category for organization"

  # === Validation Cache ===
  validationStatus:
    type: enum
    values: [valid, invalid, stale, pending]
    default: pending
    description: "Cache of last validation result"

  validationErrors:
    type: json
    optional: true
    nullable: true
    description: "Cached validation errors from last check"

  # === Lock & Concurrency ===
  isLocked:
    type: boolean
    default: false
    description: "Prevents concurrent modifications during execution"

  lockedBy:
    type: uuid
    optional: true
    nullable: true
    description: "User ID holding the lock"

  lockedAt:
    type: bigint
    optional: true
    nullable: true
    description: "Timestamp when lock was acquired (ms)"

indexes:
  # Multi-tenant filtering (required for all queries)
  - fields: [tenantId]
    name: "idx_workflow_tenant"
    unique: false

  # Common query patterns
  - fields: [tenantId, enabled]
    name: "idx_workflow_tenant_enabled"
    unique: false

  - fields: [tenantId, category]
    name: "idx_workflow_tenant_category"
    unique: false

  - fields: [tenantId, createdAt]
    name: "idx_workflow_tenant_created"
    unique: false

  - fields: [tenantId, lastExecutedAt]
    name: "idx_workflow_tenant_executed"
    unique: false

  # Execution monitoring
  - fields: [tenantId, lastExecutionStatus]
    name: "idx_workflow_tenant_status"
    unique: false

acl:
  create:
    role: [admin, god, supergod]
    condition: "tenantId must match user's tenantId"

  read:
    role: [user, admin, god, supergod]
    condition: "tenantId must match user's tenantId"

  update:
    role: [admin, god, supergod]
    condition: "tenantId must match user's tenantId AND user must own or be admin"

  delete:
    role: [admin, god, supergod]
    condition: "tenantId must match user's tenantId AND user must own or be admin"

  execute:
    role: [user, admin, god, supergod]
    condition: "workflow.enabled === true AND tenantId matches AND validation status is 'valid'"
```

### 1.2 Supporting Type Definitions

**Location**: `dbal/development/src/core/foundation/types/automation/workflow.ts`

```typescript
/**
 * Workflow node definition following N8N-style structure
 */
export interface WorkflowNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position?: [number, number]
  parameters: Record<string, unknown>
  credentials?: Record<string, unknown>
  disabled?: boolean
  timeout?: number
  retryConfig?: {
    maxAttempts: number
    backoffMultiplier: number
    initialDelay: number
  }
  errorHandler?: {
    nodeId: string
    type: 'catch' | 'notification' | 'stop'
  }
}

/**
 * Workflow connection definitions (N8N format)
 */
export type WorkflowConnections = Record<
  string,
  Record<'main' | 'error', Record<number, Array<{ node: string; input: string }>>>
>

/**
 * Workflow variable with type and validation
 */
export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'any'
  defaultValue?: unknown
  required?: boolean
  scope?: 'workflow' | 'execution' | 'global'
  description?: string
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
}

export type WorkflowVariables = Record<string, WorkflowVariable>

/**
 * Workflow execution configuration
 */
export interface WorkflowExecutionConfig {
  timeout?: number
  retryPolicy?: {
    maxAttempts: number
    backoffMultiplier: number
    initialDelay: number
  }
  concurrency?: {
    maxParallel: number
    maxQueueLength: number
  }
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error'
    persistExecutionLog: boolean
  }
  notification?: {
    onSuccess: boolean
    onFailure: boolean
    emailTo?: string[]
  }
}

/**
 * Workflow entity - main type
 */
export interface Workflow {
  id: string
  tenantId: string
  name: string
  description?: string | null
  nodes: string // JSON stringified
  edges: string // JSON stringified
  enabled: boolean
  version: number
  lastExecutedAt?: bigint | null
  executionCount: number
  lastExecutionStatus?: 'success' | 'failure' | 'pending' | 'timeout' | null
  averageExecutionTime?: number | null
  createdAt: bigint
  updatedAt: bigint
  createdBy: string
  updatedBy?: string | null
  variables?: string // JSON stringified
  config?: string // JSON stringified
  tags?: string | null
  category?: 'system' | 'user' | 'package' | 'automation' | 'integration' | 'template' | null
  validationStatus: 'valid' | 'invalid' | 'stale' | 'pending'
  validationErrors?: string | null // JSON stringified
  isLocked: boolean
  lockedBy?: string | null
  lockedAt?: bigint | null
}

/**
 * Workflow input types for CRUD operations
 */
export interface CreateWorkflowInput {
  tenantId: string // REQUIRED - enforced
  name: string
  description?: string | null
  nodes: string // JSON stringified WorkflowNode[]
  edges: string // JSON stringified WorkflowConnections
  enabled?: boolean
  version?: number
  createdBy: string // REQUIRED - from auth context
  variables?: string | null
  config?: string | null
  tags?: string | null
  category?: 'system' | 'user' | 'package' | 'automation' | 'integration' | 'template' | null
}

export interface UpdateWorkflowInput {
  name?: string
  description?: string | null
  nodes?: string
  edges?: string
  enabled?: boolean
  version?: number
  variables?: string | null
  config?: string | null
  tags?: string | null
  category?: string | null
  updatedBy?: string // REQUIRED if updating
}

export interface WorkflowQueryFilter {
  tenantId: string // MANDATORY
  enabled?: boolean
  category?: string
  createdBy?: string
  tags?: string // Partial match
  validationStatus?: 'valid' | 'invalid' | 'stale' | 'pending'
  lastExecutionStatus?: 'success' | 'failure' | 'pending' | 'timeout'
  search?: string // Full-text search on name + description
}

export interface WorkflowQueryOptions extends ListOptions {
  filter?: WorkflowQueryFilter
  includeValidationErrors?: boolean
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'lastExecutedAt' | 'executionCount' | 'name'
    direction: 'asc' | 'desc'
  }
}
```

---

## 2. Operation Signatures & Type Annotations

### 2.1 Interface Definition

**Location**: `dbal/development/src/core/entities/operations/automation/workflow-operations.ts`

```typescript
/**
 * Workflow Operations Interface
 *
 * All operations enforce multi-tenant isolation through:
 * 1. Required tenantId parameter
 * 2. ACL layer verification
 * 3. Row-level access checks
 * 4. Audit logging
 */
export interface WorkflowOperations {
  // ========== READ OPERATIONS ==========

  /**
   * Get single workflow by ID
   * - Validates tenantId ownership
   * - Returns parsed nodes/edges as objects
   * - Caches result in hot cache
   */
  get(
    id: string,
    tenantId: string,
    options?: {
      includeValidationErrors?: boolean
      parseGraphs?: boolean // Deserialize JSON to objects
    }
  ): Promise<Workflow | null>

  /**
   * List workflows with filtering
   * - Automatically filters by tenantId
   * - Supports pagination, sorting, filtering
   * - Uses warm cache for frequent queries
   */
  list(
    tenantId: string,
    options?: WorkflowQueryOptions
  ): Promise<ListResult<Workflow>>

  /**
   * Find first workflow matching filter
   * - Automatic tenantId injection
   * - Returns null if not found
   */
  findFirst(
    tenantId: string,
    filter: Partial<WorkflowQueryFilter>
  ): Promise<Workflow | null>

  /**
   * Find by field value
   * - Supports common indexed fields
   * - Automatic tenantId filtering
   */
  findByField(
    tenantId: string,
    field: 'name' | 'createdBy' | 'category' | 'tags',
    value: unknown,
    options?: { limit?: number }
  ): Promise<Workflow[]>

  /**
   * Search workflows by text
   * - Full-text search on name + description
   * - Automatic tenantId filtering
   */
  search(
    tenantId: string,
    query: string,
    options?: {
      limit?: number
      fields?: ('name' | 'description' | 'tags')[]
    }
  ): Promise<Workflow[]>

  /**
   * Get execution history
   * - Aggregated stats for workflow execution
   * - Filtered by tenantId
   */
  getExecutionStats(
    id: string,
    tenantId: string,
    timeRange?: {
      startTime: bigint
      endTime: bigint
    }
  ): Promise<{
    totalExecutions: number
    successCount: number
    failureCount: number
    averageTime: number
    lastExecution: { timestamp: bigint; status: string } | null
  }>

  // ========== WRITE OPERATIONS ==========

  /**
   * Create new workflow
   * - Validates input through validateWorkflowCreate
   * - Enforces tenantId assignment
   * - Initializes validation status to 'pending'
   * - Sets createdBy from auth context
   */
  create(
    input: CreateWorkflowInput
  ): Promise<Workflow>

  /**
   * Update workflow
   * - Validates partial input through validateWorkflowUpdate
   * - Enforces ACL check (ownership or admin)
   * - Invalidates validation cache (sets to 'stale')
   * - Bumps updatedAt timestamp
   * - Acquires write lock during update
   */
  update(
    id: string,
    tenantId: string,
    input: UpdateWorkflowInput
  ): Promise<Workflow>

  /**
   * Delete workflow
   * - Checks ACL (ownership or admin)
   * - Removes from all caches
   * - Cleans up associated execution history
   * - Verifies workflow is not currently executing
   */
  delete(
    id: string,
    tenantId: string
  ): Promise<boolean>

  /**
   * Upsert workflow (create or update)
   * - Finds by name + tenantId
   * - Creates if not exists
   * - Updates if exists
   * - Validates both paths
   */
  upsert(
    tenantId: string,
    name: string,
    createData: CreateWorkflowInput,
    updateData: UpdateWorkflowInput
  ): Promise<Workflow>

  /**
   * Bulk create workflows
   * - Validates all inputs before insertion
   * - Returns created workflows with IDs
   * - Audits each creation
   */
  createMany(
    tenantId: string,
    inputs: CreateWorkflowInput[]
  ): Promise<Workflow[]>

  /**
   * Bulk update workflows
   * - Updates multiple workflows matching filter
   * - Invalidates validation for all
   * - Returns count of updated workflows
   */
  updateMany(
    tenantId: string,
    filter: Partial<WorkflowQueryFilter>,
    input: Partial<UpdateWorkflowInput>
  ): Promise<number>

  /**
   * Bulk delete workflows
   * - Deletes workflows matching filter
   * - Returns count of deleted workflows
   */
  deleteMany(
    tenantId: string,
    filter: Partial<WorkflowQueryFilter>
  ): Promise<number>

  // ========== WORKFLOW-SPECIFIC OPERATIONS ==========

  /**
   * Validate workflow against compliance rules
   * - Uses WorkflowValidator
   * - Caches result in validation cache
   * - Updates validationStatus field
   */
  validate(
    id: string,
    tenantId: string
  ): Promise<{
    valid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
  }>

  /**
   * Lock workflow for execution
   * - Prevents concurrent modifications
   * - Sets isLocked = true, lockedBy = userId, lockedAt = now
   * - Returns false if already locked
   */
  acquireLock(
    id: string,
    tenantId: string,
    userId: string,
    timeout?: number
  ): Promise<boolean>

  /**
   * Release workflow lock
   * - Sets isLocked = false
   * - Clears lockedBy and lockedAt
   * - Returns false if not locked
   */
  releaseLock(
    id: string,
    tenantId: string,
    userId?: string // If provided, validates user owns lock
  ): Promise<boolean>

  /**
   * Update execution metadata after run
   * - Increments executionCount
   * - Sets lastExecutedAt
   * - Sets lastExecutionStatus
   * - Recalculates averageExecutionTime
   * - Does NOT update workflow definition
   */
  recordExecution(
    id: string,
    tenantId: string,
    result: {
      status: 'success' | 'failure' | 'timeout'
      executionTime: number
    }
  ): Promise<Workflow>

  /**
   * Clone workflow (deep copy)
   * - Creates new workflow with same definition
   * - Appends ' (Clone)' to name
   * - Resets execution stats
   * - Maintains same tenantId
   */
  clone(
    id: string,
    tenantId: string,
    options?: {
      newName?: string
      enabled?: boolean
    }
  ): Promise<Workflow>

  /**
   * Export workflow as JSON
   * - Returns complete workflow definition
   * - Includes validation report
   * - Portable format
   */
  export(
    id: string,
    tenantId: string
  ): Promise<{
    workflow: Workflow
    validationReport: WorkflowValidationReport
    exportedAt: bigint
  }>

  /**
   * Import workflow from external definition
   * - Validates against schema
   * - Creates new workflow in tenant
   * - Runs validator before storing
   */
  import(
    tenantId: string,
    definition: unknown,
    options?: {
      name?: string
      enabled?: boolean
    }
  ): Promise<Workflow>

  /**
   * Enable/disable workflow
   * - Updates enabled field
   * - Returns updated workflow
   */
  setEnabled(
    id: string,
    tenantId: string,
    enabled: boolean
  ): Promise<Workflow>
}
```

### 2.2 Factory Function

**Location**: `dbal/development/src/core/entities/operations/automation/workflow/index.ts`

```typescript
import type { DBALAdapter } from '../../../adapters/adapter'
import type { ACLContext } from '../../../adapters/acl-adapter/context'
import type { WorkflowOperations, Workflow, CreateWorkflowInput, UpdateWorkflowInput } from '../../../../foundation/types'
import { WorkflowValidator } from '../../../../../workflow/executor/ts/utils/workflow-validator'
import { DBALError } from '../../../../foundation/errors'

/**
 * Create workflow operations instance
 */
export function createWorkflowOperations(
  adapter: DBALAdapter,
  aclContext: ACLContext,
  validator: WorkflowValidator,
  cacheManager: WorkflowCacheManager
): WorkflowOperations {
  return {
    // Implementations follow...
  }
}
```

---

## 3. Multi-Tenant Filtering Strategy

### 3.1 Enforcement Layers

```typescript
/**
 * LAYER 1: ACL Adapter (Automatic)
 * - Enforced at adapter level
 * - All queries automatically filtered by tenantId
 * - Prevents data leakage across tenants
 */
class ACLAdapterWithWorkflows extends ACLAdapter {
  async read(entity: 'workflow', id: string): Promise<Workflow | null> {
    // 1. Extract tenantId from ACL context
    const tenantId = this.context.tenantId

    // 2. Call base adapter with tenantId filter
    const workflow = await this.baseAdapter.read('workflow', id)

    // 3. Verify tenantId matches
    if (workflow && (workflow as any).tenantId !== tenantId) {
      enforceRowAccess(this.context, 'workflow', 'read', workflow)
    }

    return workflow
  }

  async list(
    entity: 'workflow',
    options?: ListOptions
  ): Promise<ListResult<Workflow>> {
    // 1. Inject tenantId into filter
    const filter = {
      ...(options?.filter || {}),
      tenantId: this.context.tenantId
    }

    // 2. Call base adapter with tenant-filtered options
    return this.baseAdapter.list('workflow', {
      ...options,
      filter
    })
  }
}

/**
 * LAYER 2: Operation Level (Explicit)
 * - Input validation enforces tenantId presence
 * - All methods require tenantId parameter
 */
export async function getWorkflow(
  adapter: DBALAdapter,
  id: string,
  tenantId: string // EXPLICIT parameter
): Promise<Workflow | null> {
  // Validate tenantId is valid UUID
  if (!isValidUUID(tenantId)) {
    throw DBALError.validationError('Invalid tenantId', [
      { field: 'tenantId', error: 'Must be valid UUID' }
    ])
  }

  const workflow = await adapter.read('workflow', id)

  // Verify tenantId match
  if (workflow && (workflow as any).tenantId !== tenantId) {
    throw DBALError.forbidden(
      `Workflow belongs to different tenant`
    )
  }

  return workflow
}

/**
 * LAYER 3: Query Options (Filter Injection)
 * - Query filter automatically includes tenantId
 * - Cannot be overridden by user input
 */
export async function listWorkflows(
  adapter: DBALAdapter,
  tenantId: string,
  filter?: Partial<Record<string, unknown>>
): Promise<ListResult<Workflow>> {
  // Merge filter with tenantId (tenantId cannot be overridden)
  const safeFilter = {
    ...filter,
    tenantId // Force tenantId, overrides any user input
  }

  return adapter.list('workflow', { filter: safeFilter })
}
```

### 3.2 Tenant Context Propagation

```typescript
/**
 * Tenant context flows through operation chain:
 *
 * User Request
 *   ↓
 * [Authentication Middleware] extracts tenantId
 *   ↓
 * [DBALClient] receives tenantId from context
 *   ↓
 * [ACLAdapter] applies tenantId filter to all queries
 *   ↓
 * [Adapter] (Prisma/Memory) executes filtered query
 *   ↓
 * Row-level ACL check verifies tenantId ownership
 *   ↓
 * [Audit Logger] records operation with tenantId
 *   ↓
 * Response returned to user (only user's tenant data)
 */

interface TenantContext {
  tenantId: string
  userId: string
  userRole: 'user' | 'admin' | 'god' | 'supergod'
  requestId: string
  timestamp: bigint
}

class WorkflowOperationsWithContext implements WorkflowOperations {
  constructor(
    private context: TenantContext,
    private adapter: DBALAdapter,
    private validator: WorkflowValidator,
    private cache: WorkflowCacheManager
  ) {}

  async get(id: string, tenantId: string): Promise<Workflow | null> {
    // 1. Verify tenantId matches context
    if (tenantId !== this.context.tenantId) {
      throw DBALError.forbidden('Cannot access workflows from different tenant')
    }

    // 2. Check cache
    let workflow = this.cache.getHot(`workflow:${id}`)
    if (workflow) return workflow

    // 3. Query with context-based filtering
    workflow = await this.adapter.read('workflow', id)

    // 4. Verify tenantId ownership
    if (workflow && (workflow as any).tenantId !== this.context.tenantId) {
      throw DBALError.forbidden('Workflow belongs to different tenant')
    }

    // 5. Populate cache
    if (workflow) {
      this.cache.setHot(`workflow:${id}`, workflow)
    }

    return workflow
  }

  async list(
    tenantId: string,
    options?: WorkflowQueryOptions
  ): Promise<ListResult<Workflow>> {
    // 1. Verify context match
    if (tenantId !== this.context.tenantId) {
      throw DBALError.forbidden('Cannot access workflows from different tenant')
    }

    // 2. Build cache key
    const cacheKey = this.buildListCacheKey(tenantId, options)

    // 3. Check warm cache
    let cached = this.cache.getWarm(cacheKey)
    if (cached) return cached

    // 4. Query with automatic tenantId filter
    const result = await this.adapter.list('workflow', {
      ...options,
      filter: {
        ...(options?.filter || {}),
        tenantId: this.context.tenantId // Force inject
      }
    })

    // 5. Populate warm cache
    this.cache.setWarm(cacheKey, result)

    return result
  }
}
```

---

## 4. Validation & Compliance Integration

### 4.1 Validator Integration

```typescript
/**
 * Validation Flow Integration
 *
 * 1. Pre-insert validation (CREATE)
 * 2. Post-modification validation (UPDATE)
 * 3. On-demand validation (VALIDATE operation)
 * 4. Scheduled re-validation (background job)
 */

interface ValidationIntegration {
  // === PRE-OPERATION VALIDATION ===

  /**
   * Validate workflow definition before storing
   * - Checks node/edge structure
   * - Validates connections
   * - Ensures variables are properly typed
   * - Checks for multi-tenant safety issues
   */
  validateBeforeStore(
    workflow: CreateWorkflowInput | UpdateWorkflowInput
  ): Promise<void> // Throws DBALError if invalid

  // === POST-OPERATION CACHE ===

  /**
   * Cache validation result in database
   * - Updates validationStatus field
   * - Stores validation errors (if any)
   * - Updates timestamp for stale detection
   */
  cacheValidationResult(
    id: string,
    tenantId: string,
    result: WorkflowValidationResult
  ): Promise<void>

  // === VALIDATION ON DEMAND ===

  /**
   * Validate existing workflow
   * - Retrieves current definition
   * - Runs full validation
   * - Returns comprehensive report
   */
  validateWorkflow(
    id: string,
    tenantId: string
  ): Promise<WorkflowValidationReport>

  // === STALE DETECTION ===

  /**
   * Detect workflows with stale validation cache
   * - Finds workflows with validation older than TTL
   * - Returns list of IDs needing re-validation
   */
  findStaleValidations(
    tenantId: string,
    maxAgeDays?: number
  ): Promise<string[]>

  // === COMPLIANCE ENFORCEMENT ===

  /**
   * Prevent execution of invalid workflows
   * - Called before DAG executor receives workflow
   * - Throws error if validation status != 'valid'
   */
  enforceValidationBefore Execution(
    id: string,
    tenantId: string
  ): Promise<void>
}
```

### 4.2 Validation Result Schema

```typescript
interface WorkflowValidationReport {
  id: string
  tenantId: string
  timestamp: bigint
  overallValid: boolean

  // Structure validation
  structure: {
    nodesValid: boolean
    edgesValid: boolean
    connectionsValid: boolean
    errors: ValidationError[]
  }

  // Configuration validation
  configuration: {
    variablesValid: boolean
    configValid: boolean
    errors: ValidationError[]
  }

  // Compliance validation
  compliance: {
    multiTenantSafe: boolean
    resourceCompliant: boolean
    securityCompliant: boolean
    errors: ValidationError[]
  }

  // Performance validation
  performance: {
    estimatedExecutionTime: number
    estimatedMemoryUsage: number
    complexityScore: number
    warnings: ValidationError[]
  }

  // Cached until
  validUntil: bigint
}
```

---

## 5. Performance Optimization & Caching

### 5.1 Multi-Level Cache Architecture

```typescript
/**
 * Three-level caching strategy for optimal performance
 */
interface WorkflowCacheManager {
  // === HOT CACHE (In-Memory, 100ms TTL) ===

  /**
   * Cache for recently accessed workflows
   * - Used for: Single workflow lookups
   * - Invalidated: On write operations
   * - Strategy: LRU with 1000 item limit per tenant
   */
  getHot(key: string): Workflow | null
  setHot(key: string, value: Workflow, ttl?: number): void
  invalidateHot(pattern: string): void

  // === WARM CACHE (Redis, 5min TTL) ===

  /**
   * Cache for list queries and validation results
   * - Used for: Paginated lists, filtered queries
   * - Invalidated: On write operations
   * - Strategy: TTL-based expiration
   */
  getWarm(key: string): unknown | null
  setWarm(key: string, value: unknown, ttl?: number): void
  invalidateWarm(pattern: string): void

  // === COLD CACHE (Database, permanent) ===

  /**
   * Cache for validation results and execution stats
   * - Used for: Avoid re-validation, track history
   * - Invalidated: On update or stale detection
   * - Strategy: Database-backed with TTL field
   */
  // Managed through validationStatus field in Workflow entity

  // === CACHE INVALIDATION ===

  /**
   * Cascade invalidation on workflow changes
   */
  invalidateOnUpdate(id: string, tenantId: string): Promise<void>

  /**
   * Clear all tenant caches (emergency)
   */
  invalidateTenant(tenantId: string): Promise<void>

  /**
   * Get cache statistics
   */
  getStats(): {
    hotSize: number
    warmSize: number
    hitRate: number
    missRate: number
  }
}

/**
 * Implementation: In-Memory Hot Cache
 */
class HotCacheImpl {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly maxSize = 1000
  private readonly defaultTTL = 100 // ms

  get(key: string): unknown | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check TTL
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  set(key: string, value: unknown, ttl = this.defaultTTL): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt)[0][0]
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl
    })
  }

  invalidate(pattern: RegExp): void {
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Implementation: Warm Cache with Redis
 */
class WarmCacheImpl {
  constructor(private redis: RedisClient) {}

  async get(key: string): Promise<unknown | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(
    key: string,
    value: unknown,
    ttl = 300 // 5 minutes
  ): Promise<void> {
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify(value)
    )
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
```

### 5.2 Cache Key Generation

```typescript
/**
 * Deterministic cache key patterns for consistent invalidation
 */
class CacheKeyGenerator {
  /**
   * Single workflow cache key
   */
  static workflow(id: string): string {
    return `workflow:${id}`
  }

  /**
   * List query cache key
   */
  static workflowList(
    tenantId: string,
    filter?: Record<string, unknown>,
    sort?: Record<string, string>,
    pagination?: { page: number; limit: number }
  ): string {
    const filterStr = filter ? btoa(JSON.stringify(filter)) : 'none'
    const sortStr = sort ? btoa(JSON.stringify(sort)) : 'none'
    const pageStr = pagination ? `${pagination.page}:${pagination.limit}` : 'all'

    return `workflows:list:${tenantId}:${filterStr}:${sortStr}:${pageStr}`
  }

  /**
   * Validation result cache key
   */
  static validation(id: string): string {
    return `workflow:validation:${id}`
  }

  /**
   * Execution stats cache key
   */
  static stats(id: string): string {
    return `workflow:stats:${id}`
  }

  /**
   * Pattern for invalidating all lists for a tenant
   */
  static tenantListPattern(tenantId: string): RegExp {
    return new RegExp(`^workflows:list:${tenantId}:`)
  }

  /**
   * Pattern for invalidating specific workflow and related data
   */
  static workflowPattern(id: string): RegExp {
    return new RegExp(`^workflow:${id}(:|$)`)
  }
}
```

---

## 6. Error Handling Patterns

### 6.1 Workflow-Specific Error Codes

```typescript
/**
 * Extend DBALErrorCode with workflow-specific codes
 */
enum WorkflowErrorCode extends DBALErrorCode {
  // Validation errors
  INVALID_NODES = 4220,
  INVALID_EDGES = 4221,
  CIRCULAR_DEPENDENCY = 4222,
  ORPHANED_NODE = 4223,
  MISSING_VARIABLE = 4224,
  INVALID_VARIABLE_TYPE = 4225,

  // Lock errors
  WORKFLOW_LOCKED = 4231,
  LOCK_ACQUISITION_FAILED = 4232,
  LOCK_NOT_OWNED = 4233,

  // Execution errors
  WORKFLOW_NOT_EXECUTABLE = 4241,
  EXECUTION_IN_PROGRESS = 4242,
  VALIDATION_STATUS_INVALID = 4243,

  // Multi-tenant errors
  TENANT_MISMATCH = 4034,
  CROSS_TENANT_ACCESS_DENIED = 4035,

  // Import/export errors
  INVALID_EXPORT_FORMAT = 4251,
  IMPORT_VALIDATION_FAILED = 4252,

  // State errors
  WORKFLOW_NOT_FOUND = 4041,
  WORKFLOW_DISABLED = 4042,
}

/**
 * Workflow-specific error helper
 */
class WorkflowError extends DBALError {
  static invalidNodes(message: string, details?: unknown): WorkflowError {
    return new WorkflowError(
      WorkflowErrorCode.INVALID_NODES,
      `Invalid workflow nodes: ${message}`,
      details
    )
  }

  static circularDependency(path: string[]): WorkflowError {
    return new WorkflowError(
      WorkflowErrorCode.CIRCULAR_DEPENDENCY,
      `Circular dependency detected: ${path.join(' -> ')}`,
      { path }
    )
  }

  static tenantMismatch(providedTenant: string, contextTenant: string): WorkflowError {
    return new WorkflowError(
      WorkflowErrorCode.TENANT_MISMATCH,
      'Tenant ID mismatch',
      { providedTenant, contextTenant }
    )
  }

  static workflowLocked(id: string, lockedBy: string, lockedAt: bigint): WorkflowError {
    return new WorkflowError(
      WorkflowErrorCode.WORKFLOW_LOCKED,
      `Workflow is locked by another process`,
      { workflowId: id, lockedBy, lockedAt }
    )
  }

  static notExecutable(id: string, reason: string): WorkflowError {
    return new WorkflowError(
      WorkflowErrorCode.WORKFLOW_NOT_EXECUTABLE,
      `Workflow cannot be executed: ${reason}`,
      { workflowId: id }
    )
  }
}
```

### 6.2 Error Handling in Operations

```typescript
/**
 * Safe operation wrapper with error handling
 */
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    operationName: string
    workflowId?: string
    tenantId: string
    userId?: string
  }
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // 1. Extract error context
    const errorCode = error instanceof DBALError ? error.code : 500
    const message = error instanceof Error ? error.message : 'Unknown error'

    // 2. Audit the error
    await auditLog({
      operationName: context.operationName,
      workflowId: context.workflowId,
      tenantId: context.tenantId,
      userId: context.userId,
      status: 'error',
      errorCode,
      errorMessage: message,
      timestamp: BigInt(Date.now())
    })

    // 3. Clean up if necessary
    if (context.workflowId) {
      // Release any locks
      await releaseLock(context.workflowId, context.tenantId).catch(() => {})
      // Invalidate caches
      cache.invalidateOnUpdate(context.workflowId, context.tenantId).catch(() => {})
    }

    // 4. Re-throw with context
    throw error
  }
}

/**
 * Usage example
 */
async function createWorkflowSafely(
  input: CreateWorkflowInput,
  tenantId: string,
  userId: string
): Promise<Workflow> {
  return withErrorHandling(
    () => createWorkflow(input),
    {
      operationName: 'createWorkflow',
      tenantId,
      userId
    }
  )
}
```

---

## 7. Integration with Existing DBAL Components

### 7.1 Adapter Integration

```typescript
/**
 * Workflow operations work with any adapter (Prisma, Memory, etc.)
 */
interface DBALAdapterWorkflowSupport extends DBALAdapter {
  // Standard CRUD
  create(entity: 'workflow', data: Record<string, unknown>): Promise<Workflow>
  read(entity: 'workflow', id: string): Promise<Workflow | null>
  update(entity: 'workflow', id: string, data: Record<string, unknown>): Promise<Workflow>
  delete(entity: 'workflow', id: string): Promise<boolean>
  list(entity: 'workflow', options?: ListOptions): Promise<ListResult<Workflow>>

  // Extended operations
  findFirst(entity: 'workflow', filter?: Record<string, unknown>): Promise<Workflow | null>
  findByField(entity: 'workflow', field: string, value: unknown): Promise<Workflow | null>
  upsert(
    entity: 'workflow',
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>
  ): Promise<Workflow>
  createMany(entity: 'workflow', data: Record<string, unknown>[]): Promise<number>
  updateMany(
    entity: 'workflow',
    filter: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number>
  deleteMany(entity: 'workflow', filter?: Record<string, unknown>): Promise<number>
}
```

### 7.2 ACL Adapter Integration

```typescript
/**
 * ACL layer transparently enforces multi-tenant isolation
 */
class ACLAdapterWorkflowEnforcer {
  /**
   * BEFORE: Raw query to adapter
   * AFTER: Query with automatic tenantId filter + row-level ACL check
   */
  async list(
    entity: 'workflow',
    options?: ListOptions
  ): Promise<ListResult<Workflow>> {
    // Step 1: Inject tenantId into filter (cannot be overridden)
    const safeFilter = {
      ...(options?.filter || {}),
      tenantId: this.context.tenantId
    }

    // Step 2: Query with filtered options
    const result = await this.baseAdapter.list('workflow', {
      ...options,
      filter: safeFilter
    })

    // Step 3: Row-level ACL verification (extra safety)
    for (const workflow of result.items) {
      enforceRowAccess(this.context, 'workflow', 'list', workflow)
    }

    // Step 4: Audit
    await this.auditLog('list', 'workflow', {
      count: result.items.length,
      tenantId: this.context.tenantId
    })

    return result
  }

  /**
   * Read with multi-tenant safety
   */
  async read(entity: 'workflow', id: string): Promise<Workflow | null> {
    // Step 1: Query
    const workflow = await this.baseAdapter.read('workflow', id)

    // Step 2: Check tenantId ownership
    if (workflow && (workflow as any).tenantId !== this.context.tenantId) {
      enforceRowAccess(this.context, 'workflow', 'read', workflow)
      // If we got here, enforceRowAccess didn't throw, so user has access
    }

    // Step 3: Audit
    await this.auditLog('read', 'workflow', {
      id,
      tenantId: this.context.tenantId,
      found: !!workflow
    })

    return workflow
  }
}
```

### 7.3 Client Integration

```typescript
/**
 * DBAL client exposes workflow operations
 */
class DBALClient {
  private workflows: WorkflowOperations

  constructor(config: DBALConfig) {
    // ... initialize adapter, ACL, cache, validator

    this.workflows = createWorkflowOperations(
      this.adapter,
      this.aclContext,
      this.validator,
      this.cacheManager
    )
  }

  /**
   * Usage
   */
  async getWorkflow(id: string, tenantId: string): Promise<Workflow | null> {
    return this.workflows.get(id, tenantId)
  }

  async listWorkflows(
    tenantId: string,
    options?: WorkflowQueryOptions
  ): Promise<ListResult<Workflow>> {
    return this.workflows.list(tenantId, options)
  }

  async createWorkflow(input: CreateWorkflowInput): Promise<Workflow> {
    return this.workflows.create(input)
  }

  async validateWorkflow(id: string, tenantId: string) {
    return this.workflows.validate(id, tenantId)
  }

  async acquireWorkflowLock(
    id: string,
    tenantId: string,
    userId: string
  ): Promise<boolean> {
    return this.workflows.acquireLock(id, tenantId, userId)
  }
}
```

---

## 8. Implementation Checklist

### Phase 1: Core Structure (Week 1)

- [ ] Create extended workflow entity schema (YAML)
- [ ] Define TypeScript types and interfaces
- [ ] Implement WorkflowQueryFilter and related types
- [ ] Create error codes and WorkflowError class
- [ ] Set up folder structure: `dbal/development/src/core/entities/workflow/`

### Phase 2: Basic Operations (Week 2)

- [ ] Implement `create()` with validation
- [ ] Implement `read()` with cache support
- [ ] Implement `update()` with lock management
- [ ] Implement `delete()` with cleanup
- [ ] Implement `list()` with filtering and pagination
- [ ] Add ACL layer enforcement

### Phase 3: Advanced Operations (Week 3)

- [ ] Implement `validate()` with WorkflowValidator integration
- [ ] Implement `acquireLock()` and `releaseLock()`
- [ ] Implement `recordExecution()`
- [ ] Implement `clone()` and `export()` / `import()`
- [ ] Implement `findByField()` and `search()`

### Phase 4: Caching & Optimization (Week 4)

- [ ] Implement hot cache (in-memory)
- [ ] Implement warm cache (Redis if available)
- [ ] Create CacheKeyGenerator
- [ ] Add cache invalidation on updates
- [ ] Implement cache statistics

### Phase 5: Testing & Integration (Week 5)

- [ ] Write unit tests for all operations
- [ ] Write integration tests with adapter
- [ ] Write multi-tenant isolation tests
- [ ] Write validation integration tests
- [ ] Performance benchmarks
- [ ] Integration with DAG executor

### Phase 6: Documentation & Deployment (Week 6)

- [ ] Update DBAL API documentation
- [ ] Create usage examples
- [ ] Migration guide for existing code
- [ ] Performance tuning guide
- [ ] Troubleshooting guide

---

## 9. API Usage Examples

### 9.1 Basic CRUD

```typescript
// Create workflow
const workflow = await db.workflows.create({
  tenantId: 'tenant-123',
  name: 'Data Pipeline',
  description: 'ETL workflow for sales data',
  nodes: JSON.stringify([
    { id: '1', name: 'Trigger', type: 'webhook', ... },
    { id: '2', name: 'Transform', type: 'code', ... }
  ]),
  edges: JSON.stringify({
    'Trigger': { main: { 0: [{ node: 'Transform', input: 'input' }] } }
  }),
  enabled: true,
  createdBy: 'user-456'
})

// Get workflow
const loaded = await db.workflows.get(workflow.id, 'tenant-123')

// List with filtering
const list = await db.workflows.list('tenant-123', {
  filter: { enabled: true, category: 'automation' },
  sort: { field: 'createdAt', direction: 'desc' },
  page: 1,
  limit: 20
})

// Update
const updated = await db.workflows.update(workflow.id, 'tenant-123', {
  name: 'Updated Data Pipeline',
  enabled: false
})

// Delete
const deleted = await db.workflows.delete(workflow.id, 'tenant-123')
```

### 9.2 Validation & Execution

```typescript
// Validate workflow
const validation = await db.workflows.validate(workflowId, tenantId)
if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
}

// Acquire lock before execution
const locked = await db.workflows.acquireLock(workflowId, tenantId, userId)
if (!locked) {
  throw new Error('Workflow is already executing')
}

try {
  // Execute workflow...

  // Record execution results
  await db.workflows.recordExecution(workflowId, tenantId, {
    status: 'success',
    executionTime: 1234
  })
} finally {
  // Release lock
  await db.workflows.releaseLock(workflowId, tenantId, userId)
}
```

### 9.3 Advanced Operations

```typescript
// Clone workflow
const cloned = await db.workflows.clone(originalId, tenantId, {
  newName: 'Data Pipeline (Clone)',
  enabled: false
})

// Export for backup
const exported = await db.workflows.export(workflowId, tenantId)
fs.writeFileSync('workflow-backup.json', JSON.stringify(exported, null, 2))

// Import from file
const definition = JSON.parse(fs.readFileSync('workflow.json', 'utf-8'))
const imported = await db.workflows.import(tenantId, definition, {
  name: 'Imported Workflow',
  enabled: false
})

// Search workflows
const results = await db.workflows.search(tenantId, 'data pipeline', {
  limit: 10,
  fields: ['name', 'description']
})

// Get execution stats
const stats = await db.workflows.getExecutionStats(workflowId, tenantId, {
  startTime: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endTime: BigInt(Date.now())
})
```

---

## 10. Performance Targets

| Operation | Current | Target | Strategy |
|-----------|---------|--------|----------|
| Get workflow | N/A | <50ms | Hot cache (in-memory) |
| List workflows | N/A | <200ms | Warm cache + pagination |
| Create workflow | N/A | <500ms | Async validation in background |
| Validate | N/A | <1s | Cache validation results, TTL 1 hour |
| Lock acquisition | N/A | <10ms | In-memory lock map |
| Search | N/A | <500ms | Full-text index on name+description |
| Clone | N/A | <1s | Async copy + validation |

---

## 11. Security Considerations

### 11.1 Multi-Tenant Isolation Guarantees

```
✓ Tenant context required for all operations
✓ TenantId validated at ACL layer
✓ Row-level ACL prevents cross-tenant access
✓ Query filters automatically include tenantId
✓ Cache keys scoped to tenantId
✓ Audit logs record tenantId for all operations
✓ Lock ownership enforced per tenant
```

### 11.2 Authorization Rules

```typescript
interface WorkflowAuthz {
  // Anyone can read workflows they own (createdBy) or their tenant's workflows (admin)
  read: {
    owner: true // createdBy matches userId
    admin: true // userRole is admin
    public: false // No public workflows
  }

  // Only admins can update
  update: {
    owner: true // createdBy matches userId AND userRole is admin
    admin: true
    public: false
  }

  // Only admins can delete
  delete: {
    admin: true
    public: false
  }

  // Anyone can execute (if enabled and valid)
  execute: {
    owner: true
    admin: true
    user: true // workflow.enabled && validation.valid
    public: false
  }

  // Execution lock can only be released by lock owner or admin
  releaseLock: {
    lockOwner: true // userId matches lockedBy
    admin: true
    public: false
  }
}
```

---

## 12. Dependencies & Integrations

### 12.1 Required Components

| Component | Location | Purpose |
|-----------|----------|---------|
| DBALAdapter | `dbal/development/src/adapters/adapter.ts` | Base query operations |
| ACLAdapter | `dbal/development/src/adapters/acl-adapter/` | Multi-tenant filtering + audit |
| WorkflowValidator | `workflow/executor/ts/utils/workflow-validator.ts` | Validation compliance |
| DBALError | `dbal/development/src/core/foundation/errors.ts` | Error handling |
| TenantContext | `dbal/development/src/core/foundation/tenant-context.ts` | Multi-tenant context |

### 12.2 Integration Points

```
Workflow Operations
    ↓
ACL Adapter (enforces multi-tenant + row-level ACL)
    ↓
Prisma/Memory Adapter (executes queries)
    ↓
Database (SQLite/PostgreSQL)

Workflow Operations
    ↓
WorkflowValidator (validates before store)
    ↓
DAG Executor (uses validated workflows)

Workflow Operations
    ↓
Cache Manager (hot/warm/cold)
    ↓
In-Memory/Redis/Database caches
```

---

## 13. Known Limitations & Future Enhancements

### 13.1 Current Limitations

| Limitation | Reason | Mitigation |
|-----------|--------|-----------|
| Workflow graph as JSON string | Prisma limitation | Support native JSON fields in Phase 3 |
| No concurrent execution tracking | Architectural simplicity | Add execution queue in Phase 3 |
| Validation cache TTL fixed at 1hr | Trade-off between freshness and performance | Make configurable in Phase 2 |
| No workflow versioning | Scope for Phase 2 | Implement version history table |
| Manual lock release required | Safety over automation | Add automatic timeout and cleanup |

### 13.2 Future Enhancements

- [ ] Workflow execution history table with detailed logs
- [ ] Real-time execution monitoring via WebSocket
- [ ] Workflow analytics and insights
- [ ] Collaborative workflow editing with conflict resolution
- [ ] Workflow templates library
- [ ] Workflow composition and nesting
- [ ] Conditional workflow creation based on execution results
- [ ] Native TypeScript node support (no JSON serialization)

---

## 14. Testing Strategy

### 14.1 Test Coverage

```
Unit Tests (90% coverage)
├── Create operations (validation, tenantId enforcement)
├── Read operations (caching, ACL checks)
├── Update operations (lock management, cache invalidation)
├── Delete operations (cleanup, cascade effects)
├── Query filters (tenantId injection, multi-field filtering)
├── Validation integration (validator calls, result caching)
├── Cache behavior (TTL, invalidation patterns)
└── Error handling (proper error codes, context preservation)

Integration Tests
├── Multi-adapter compatibility (Prisma, Memory)
├── ACL enforcement (cross-tenant isolation)
├── Cache coordination (hot + warm cache consistency)
├── Validator integration (full workflow validation)
├── Concurrent operations (lock contention)
└── Error scenarios (database failures, timeouts)

E2E Tests
├── Complete workflow lifecycle
├── Multi-tenant scenarios
├── Performance benchmarks
└── Real DAG executor integration
```

### 14.2 Test Data Fixtures

```typescript
const testFixtures = {
  validWorkflow: {
    tenantId: 'tenant-123',
    name: 'Valid Workflow',
    nodes: '[{"id":"1","name":"Start","type":"trigger"}]',
    edges: '{}',
    enabled: true,
    createdBy: 'user-456'
  },

  invalidWorkflow: {
    tenantId: 'tenant-123',
    name: 'Invalid Workflow',
    nodes: 'invalid json',
    edges: '{}',
    enabled: true,
    createdBy: 'user-456'
  },

  crossTenantAttack: {
    tenantId: 'tenant-999', // Different tenant
    name: 'Attack Workflow',
    nodes: '[]',
    edges: '{}',
    enabled: true,
    createdBy: 'attacker-user'
  }
}
```

---

## 15. Related Documentation

- [DBAL Architecture Overview](./CLAUDE.md#dbal---database-abstraction-layer)
- [Multi-Tenant Safety Audit](./MULTI_TENANT_AUDIT.md)
- [Workflow Validator Specification](./WORKFLOW_VALIDATION_CHECKLIST.md)
- [Rate Limiting Guide](./RATE_LIMITING_GUIDE.md)
- [ACL System Documentation](./ACL_SYSTEM.md)

---

**Status**: Ready for Phase 2 Implementation
**Next Steps**: Create YAML entity schema and TypeScript type definitions
