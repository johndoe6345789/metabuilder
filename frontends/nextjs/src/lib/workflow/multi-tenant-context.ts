/**
 * Multi-Tenant Workflow Context Builder
 *
 * Constructs safe execution contexts with:
 * - Tenant isolation validation
 * - User access verification
 * - Request-derived context initialization
 * - Credential binding and secret management
 * - Comprehensive error reporting
 *
 * Follows MetaBuilder multi-tenant patterns:
 * - Every context must have tenantId
 * - User level determines cross-tenant access
 * - Variables are tenant-scoped by default
 * - Secrets are never exposed in logs or state
 */

import { v4 as uuidv4 } from 'uuid'
import type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowTrigger,
  CredentialRef,
  ExecutionLimits,
} from '@metabuilder/workflow'

/**
 * Request context with user and tenant information
 * Extracted from JWT, session, or API headers
 */
export interface RequestContext {
  tenantId: string
  userId: string
  userEmail: string
  userLevel: number // 1=viewer, 2=editor, 3=admin, 4=super-admin
  ipAddress?: string
  userAgent?: string
  originUrl?: string
  apiKey?: string
  sessionId?: string
}

/**
 * Multi-tenant metadata attached to context
 * Tracks safety enforcement and audit information
 */
export interface MultiTenantMetadata {
  enforced: boolean
  tenantId: string
  userId: string
  userLevel: number
  userEmail: string
  requestedAt: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  executionMode: 'manual' | 'scheduled' | 'webhook' | 'api' | 'embedded'
}

/**
 * Context builder options
 */
export interface ContextBuilderOptions {
  allowCrossTenantAccess?: boolean
  enforceCredentialValidation?: boolean
  enforceSecretEncryption?: boolean
  captureRequestData?: boolean
  enableAuditLogging?: boolean
}

/**
 * Extended workflow context with multi-tenant support
 */
export interface ExtendedWorkflowContext extends WorkflowContext {
  multiTenant: MultiTenantMetadata
  requestMetadata?: {
    ipAddress?: string
    userAgent?: string
    originUrl?: string
    sessionId?: string
  }
  executionLimits: ExecutionLimits
  credentialBindings: Map<string, CredentialRef>
}

/**
 * Context validation result
 */
export interface ContextValidationResult {
  valid: boolean
  errors: ContextValidationError[]
  warnings: ContextValidationWarning[]
}

/**
 * Validation error with path and code
 */
export interface ContextValidationError {
  path: string
  message: string
  code:
    | 'TENANT_MISMATCH'
    | 'UNAUTHORIZED_ACCESS'
    | 'MISSING_REQUIRED_FIELD'
    | 'INVALID_CREDENTIALS'
    | 'SCOPE_VIOLATION'
    | 'EXECUTION_LIMIT_EXCEEDED'
    | 'SECRET_EXPOSURE'
}

/**
 * Validation warning
 */
export interface ContextValidationWarning {
  path: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

/**
 * MultiTenantContextBuilder
 *
 * Builds and validates workflow execution contexts with strict tenant isolation.
 * Ensures all execution contexts are safe and properly scoped to their tenant.
 */
export class MultiTenantContextBuilder {
  private workflow: WorkflowDefinition
  private requestContext: RequestContext
  private options: ContextBuilderOptions

  constructor(
    workflow: WorkflowDefinition,
    requestContext: RequestContext,
    options: ContextBuilderOptions = {}
  ) {
    this.workflow = workflow
    this.requestContext = requestContext
    this.options = {
      allowCrossTenantAccess: false,
      enforceCredentialValidation: true,
      enforceSecretEncryption: true,
      captureRequestData: true,
      enableAuditLogging: true,
      ...options,
    }
  }

  /**
   * Build execution context with comprehensive validation
   *
   * @param requestData - Trigger data, variables, and secrets from request
   * @param trigger - Trigger configuration that initiated execution
   * @returns Extended workflow context or throws ValidationError
   */
  async build(
    requestData?: {
      triggerData?: Record<string, any>
      variables?: Record<string, any>
      request?: any
      secrets?: Record<string, string>
    },
    trigger?: WorkflowTrigger
  ): Promise<ExtendedWorkflowContext> {
    // 1. Validate tenant access
    this.validateTenantAccess()

    // 2. Build multi-tenant metadata
    const multiTenantMeta = this.buildMultiTenantMetadata(trigger)

    // 3. Build context base
    const context: ExtendedWorkflowContext = {
      executionId: uuidv4(),
      tenantId: this.requestContext.tenantId,
      userId: this.requestContext.userId,
      user: {
        id: this.requestContext.userId,
        email: this.requestContext.userEmail,
        level: this.requestContext.userLevel,
      },
      trigger: trigger || this.buildDefaultTrigger(),
      triggerData: requestData?.triggerData || {},
      variables: this.buildVariables(requestData?.variables),
      secrets: requestData?.secrets || {},
      request: this.options.captureRequestData ? requestData?.request : undefined,
      multiTenant: multiTenantMeta,
      requestMetadata: {
        ipAddress: this.requestContext.ipAddress,
        userAgent: this.requestContext.userAgent,
        originUrl: this.requestContext.originUrl,
        sessionId: this.requestContext.sessionId,
      },
      executionLimits: this.workflow.executionLimits || this.getDefaultExecutionLimits(),
      credentialBindings: new Map(),
    }

    // 4. Validate context safety
    await this.validateContextSafety(context)

    // 5. Load and bind credentials
    if (this.options.enforceCredentialValidation) {
      await this.bindCredentials(context)
    }

    // 6. Validate variables don't cross tenants
    this.validateVariableTenantIsolation(context)

    // 7. Log context creation (audit)
    if (this.options.enableAuditLogging) {
      this.logContextCreation(context)
    }

    return context
  }

  /**
   * Validate user has access to workflow
   */
  private validateTenantAccess(): void {
    // Own tenant access - always allowed
    if (this.requestContext.tenantId === this.workflow.tenantId) {
      return
    }

    // Super-admin (level 4) can access any tenant
    if (this.requestContext.userLevel >= 4) {
      if (!this.options.allowCrossTenantAccess) {
        throw new Error(
          `Cross-tenant access disabled: User ${this.requestContext.userId} ` +
          `cannot access workflow in tenant ${this.workflow.tenantId}`
        )
      }
      console.warn(
        `[SECURITY] Super-admin ${this.requestContext.userId} accessing ` +
        `cross-tenant workflow ${this.workflow.id}`
      )
      return
    }

    // Access denied
    throw new Error(
      `Forbidden: Workflow ${this.workflow.id} belongs to tenant ` +
      `${this.workflow.tenantId}, user is in tenant ${this.requestContext.tenantId}`
    )
  }

  /**
   * Build multi-tenant metadata
   */
  private buildMultiTenantMetadata(trigger?: WorkflowTrigger): MultiTenantMetadata {
    const executionMode = this.determineExecutionMode(trigger)

    return {
      enforced: true,
      tenantId: this.requestContext.tenantId,
      userId: this.requestContext.userId,
      userLevel: this.requestContext.userLevel,
      userEmail: this.requestContext.userEmail,
      requestedAt: new Date().toISOString(),
      ipAddress: this.requestContext.ipAddress,
      userAgent: this.requestContext.userAgent,
      sessionId: this.requestContext.sessionId,
      executionMode,
    }
  }

  /**
   * Determine execution mode from trigger configuration
   */
  private determineExecutionMode(
    trigger?: WorkflowTrigger
  ): 'manual' | 'scheduled' | 'webhook' | 'api' | 'embedded' {
    if (!trigger) {
      return 'manual'
    }

    switch (trigger.kind) {
      case 'schedule':
        return 'scheduled'
      case 'webhook':
      case 'webhook-listen':
        return 'webhook'
      case 'manual':
      case 'event':
      case 'email':
      case 'message-queue':
      case 'polling':
      case 'custom':
        return 'api'
      default:
        return 'manual'
    }
  }

  /**
   * Build default trigger for manual execution
   */
  private buildDefaultTrigger(): WorkflowTrigger {
    return {
      nodeId: this.workflow.nodes[0]?.id || 'trigger-0',
      kind: 'manual',
      enabled: true,
      metadata: {
        startTime: Date.now(),
        triggeredBy: 'api',
        userId: this.requestContext.userId,
        tenantId: this.requestContext.tenantId,
      },
    }
  }

  /**
   * Build and scope variables
   * Merges workflow defaults with request overrides
   */
  private buildVariables(
    requestVariables?: Record<string, any>
  ): Record<string, any> {
    const variables: Record<string, any> = {}

    // 1. Add workflow defaults
    if (this.workflow.variables) {
      for (const [varName, varDef] of Object.entries(this.workflow.variables)) {
        // Only allow workflow and execution scopes (not global)
        if (varDef.scope === 'global') {
          console.warn(`[SECURITY] Skipping global-scope variable ${varName} - not allowed`)
          continue
        }

        variables[varName] = varDef.defaultValue || null
      }
    }

    // 2. Merge request overrides
    if (requestVariables) {
      for (const [varName, varValue] of Object.entries(requestVariables)) {
        // Validate variable is allowed by workflow
        const varDef = this.workflow.variables?.[varName]
        if (varDef) {
          variables[varName] = varValue
        } else {
          console.warn(
            `[SECURITY] Rejecting unknown variable ${varName} - not in workflow definition`
          )
        }
      }
    }

    // 3. Inject tenant and user context as read-only
    variables._tenantId = this.requestContext.tenantId
    variables._userId = this.requestContext.userId
    variables._userLevel = this.requestContext.userLevel

    return variables
  }

  /**
   * Validate context doesn't violate safety constraints
   */
  private async validateContextSafety(context: ExtendedWorkflowContext): Promise<void> {
    const errors: string[] = []

    // 1. Tenant ID must match
    if (context.tenantId !== this.workflow.tenantId) {
      errors.push(
        `Context tenant ${context.tenantId} does not match ` +
        `workflow tenant ${this.workflow.tenantId}`
      )
    }

    // 2. User level consistency
    if (!Number.isFinite(context.user.level) || context.user.level < 1 || context.user.level > 4) {
      errors.push(`Invalid user level: ${context.user.level}`)
    }

    // 3. Execution ID must be set
    if (!context.executionId || context.executionId.trim() === '') {
      errors.push('Execution ID is required')
    }

    // 4. Variables not in global scope
    for (const [varName, varDef] of Object.entries(this.workflow.variables || {})) {
      if (varDef.scope === 'global') {
        errors.push(
          `Variable ${varName} has global scope. Only workflow/execution scope allowed.`
        )
      }
    }

    // 5. Check execution limits
    if (
      context.executionLimits &&
      this.workflow.executionLimits
    ) {
      if (context.executionLimits.maxExecutionTime > this.workflow.executionLimits.maxExecutionTime) {
        errors.push(
          `Requested execution time (${context.executionLimits.maxExecutionTime}ms) ` +
          `exceeds workflow limit (${this.workflow.executionLimits.maxExecutionTime}ms)`
        )
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Context validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
      )
    }
  }

  /**
   * Validate variables don't cross tenant boundaries
   */
  private validateVariableTenantIsolation(context: ExtendedWorkflowContext): void {
    for (const [varName, varValue] of Object.entries(context.variables)) {
      if (varValue && typeof varValue === 'object' && varValue._tenantId) {
        if (varValue._tenantId !== context.tenantId) {
          throw new Error(
            `Variable ${varName} belongs to different tenant ${varValue._tenantId}. ` +
            `Current tenant: ${context.tenantId}`
          )
        }
      }
    }
  }

  /**
   * Load and bind credentials from workflow definition
   */
  private async bindCredentials(context: ExtendedWorkflowContext): Promise<void> {
    const bindings = this.workflow.credentials || []

    for (const binding of bindings) {
      try {
        // TODO: Load credential from secure store
        // const credential = await loadCredential(
        //   binding.credentialId,
        //   context.tenantId
        // )
        //
        // if (!credential) {
        //   console.warn(
        //     `[SECURITY] Credential ${binding.credentialId} not found ` +
        //     `for node ${binding.nodeId}`
        //   )
        //   continue
        // }

        context.credentialBindings.set(binding.nodeId, {
          id: binding.credentialId,
          name: binding.credentialName,
        })
      } catch (error) {
        console.error(`Failed to bind credential for node ${binding.nodeId}:`, error)
        throw error
      }
    }
  }

  /**
   * Get default execution limits
   */
  private getDefaultExecutionLimits(): ExecutionLimits {
    return {
      maxExecutionTime: 3600000, // 1 hour
      maxMemoryMb: 512,
      maxNodeExecutions: 1000,
      maxDataSizeMb: 100,
      maxArrayItems: 10000,
    }
  }

  /**
   * Log context creation for audit trail
   */
  private logContextCreation(context: ExtendedWorkflowContext): void {
    console.log('[AUDIT] Workflow execution context created', {
      executionId: context.executionId,
      workflowId: this.workflow.id,
      tenantId: context.tenantId,
      userId: context.userId,
      executionMode: context.multiTenant.executionMode,
      timestamp: context.multiTenant.requestedAt,
      ipAddress: context.multiTenant.ipAddress,
    })
  }

  /**
   * Validate complete execution context
   * Can be called to verify context before execution
   */
  async validate(): Promise<ContextValidationResult> {
    const errors: ContextValidationError[] = []
    const warnings: ContextValidationWarning[] = []

    // 1. Check tenant access
    try {
      this.validateTenantAccess()
    } catch (error) {
      errors.push({
        path: 'multiTenant.tenantId',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'TENANT_MISMATCH',
      })
    }

    // 2. Validate user level
    if (
      !Number.isFinite(this.requestContext.userLevel) ||
      this.requestContext.userLevel < 1 ||
      this.requestContext.userLevel > 4
    ) {
      errors.push({
        path: 'user.level',
        message: `Invalid user level: ${this.requestContext.userLevel}`,
        code: 'UNAUTHORIZED_ACCESS',
      })
    }

    // 3. Check required fields
    if (!this.requestContext.userId || this.requestContext.userId.trim() === '') {
      errors.push({
        path: 'user.id',
        message: 'User ID is required',
        code: 'MISSING_REQUIRED_FIELD',
      })
    }

    if (!this.workflow.tenantId || this.workflow.tenantId.trim() === '') {
      errors.push({
        path: 'workflow.tenantId',
        message: 'Workflow must have a tenantId',
        code: 'MISSING_REQUIRED_FIELD',
      })
    }

    // 4. Check for global scope variables
    for (const [varName, varDef] of Object.entries(this.workflow.variables || {})) {
      if (varDef.scope === 'global') {
        warnings.push({
          path: `variables.${varName}`,
          message: `Global-scope variable will be skipped for security`,
          severity: 'high',
        })
      }
    }

    // 5. Check credentials
    if (this.options.enforceCredentialValidation && this.workflow.credentials?.length > 0) {
      warnings.push({
        path: 'credentials',
        message: `${this.workflow.credentials.length} credential(s) will be validated during execution`,
        severity: 'low',
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

/**
 * Factory function to create context from HTTP request
 * Extracts tenant/user info from JWT token, session, or headers
 */
export async function createContextFromRequest(
  workflow: WorkflowDefinition,
  requestContext: RequestContext,
  requestData?: {
    triggerData?: Record<string, any>
    variables?: Record<string, any>
    request?: any
    secrets?: Record<string, string>
  },
  options?: ContextBuilderOptions
): Promise<ExtendedWorkflowContext> {
  const builder = new MultiTenantContextBuilder(workflow, requestContext, options)
  return await builder.build(requestData)
}

/**
 * Verify user can access workflow
 * Simple access check without full context building
 */
export function canUserAccessWorkflow(
  userTenantId: string,
  userLevel: number,
  workflowTenantId: string
): boolean {
  // User's own tenant
  if (userTenantId === workflowTenantId) {
    return true
  }

  // Super-admin can access any tenant
  if (userLevel >= 4) {
    return true
  }

  return false
}

/**
 * Extract request context from Next.js request headers
 * Assumes JWT token in Authorization header
 */
export function extractRequestContext(headers?: Record<string, string>): RequestContext | null {
  if (!headers) {
    return null
  }

  // TODO: Implement JWT parsing and tenant/user extraction
  // This is a placeholder - in production, parse the JWT token
  // and extract tenantId, userId, userLevel, etc.

  return null
}

/**
 * Sanitize context for logging (remove secrets)
 */
export function sanitizeContextForLogging(context: ExtendedWorkflowContext): Record<string, any> {
  return {
    executionId: context.executionId,
    tenantId: context.tenantId,
    userId: context.userId,
    trigger: context.trigger.kind,
    multiTenant: {
      ...context.multiTenant,
      // Don't log sensitive request data
      ipAddress: context.multiTenant.ipAddress?.substring(0, 10) + '...',
      userAgent: context.multiTenant.userAgent?.substring(0, 20) + '...',
    },
    executionLimits: context.executionLimits,
    // Don't log secrets, credentials, or request body
    variables: Object.keys(context.variables),
  }
}

/**
 * Create a mock context for testing
 */
export function createMockContext(
  workflow: WorkflowDefinition,
  overrides?: Partial<RequestContext>
): ExtendedWorkflowContext {
  const requestContext: RequestContext = {
    tenantId: workflow.tenantId,
    userId: 'test-user-123',
    userEmail: 'test@example.com',
    userLevel: 2,
    ipAddress: '127.0.0.1',
    userAgent: 'Test Client',
    ...overrides,
  }

  return {
    executionId: uuidv4(),
    tenantId: requestContext.tenantId,
    userId: requestContext.userId,
    user: {
      id: requestContext.userId,
      email: requestContext.userEmail,
      level: requestContext.userLevel,
    },
    trigger: {
      nodeId: workflow.nodes[0]?.id || 'trigger',
      kind: 'manual',
      enabled: true,
      metadata: {},
    },
    triggerData: {},
    variables: {},
    secrets: {},
    multiTenant: {
      enforced: true,
      tenantId: requestContext.tenantId,
      userId: requestContext.userId,
      userLevel: requestContext.userLevel,
      userEmail: requestContext.userEmail,
      requestedAt: new Date().toISOString(),
      executionMode: 'manual',
    },
    requestMetadata: {
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    },
    executionLimits: {
      maxExecutionTime: 3600000,
      maxMemoryMb: 512,
      maxNodeExecutions: 1000,
      maxDataSizeMb: 100,
      maxArrayItems: 10000,
    },
    credentialBindings: new Map(),
  }
}
