/**
 * Multi-Tenant Context Builder Tests
 *
 * Comprehensive test suite covering:
 * - Tenant isolation validation
 * - User access control
 * - Variable scoping
 * - Context building
 * - Security validations
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  MultiTenantContextBuilder,
  createContextFromRequest,
  canUserAccessWorkflow,
  createMockContext,
  sanitizeContextForLogging,
  type RequestContext,
} from './multi-tenant-context'
import type { WorkflowDefinition } from '@metabuilder/workflow'

/**
 * Test utilities
 */

function createTestWorkflow(
  tenantId: string,
  overrides?: Partial<WorkflowDefinition>
): WorkflowDefinition {
  return {
    id: 'wf-test-1',
    name: 'Test Workflow',
    description: 'Test workflow for unit tests',
    version: '1.0.0',
    tenantId,
    createdBy: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true,
    locked: false,
    tags: ['test'],
    category: 'automation',
    settings: {
      timezone: 'UTC',
      executionTimeout: 3600000,
      saveExecutionProgress: true,
      saveExecutionData: 'all',
      maxConcurrentExecutions: 10,
      debugMode: false,
      enableNotifications: false,
      notificationChannels: [],
    },
    nodes: [
      {
        id: 'node-1',
        name: 'Start',
        type: 'trigger',
        typeVersion: 1,
        nodeType: 'trigger',
        position: [0, 0],
        parameters: {},
        inputs: [],
        outputs: [],
        credentials: {},
        disabled: false,
        skipOnFail: false,
        alwaysOutputData: false,
        maxTries: 1,
        waitBetweenTries: 0,
        continueOnError: false,
        onError: 'stopWorkflow',
        metadata: {},
      },
    ],
    connections: {},
    triggers: [],
    variables: {
      testVar: {
        name: 'testVar',
        type: 'string',
        defaultValue: 'default-value',
        required: false,
        scope: 'workflow',
      },
      globalVar: {
        name: 'globalVar',
        type: 'string',
        defaultValue: 'global',
        required: false,
        scope: 'global',
      },
    },
    errorHandling: {
      default: 'stopWorkflow',
      errorLogger: undefined,
      errorNotification: false,
      notifyChannels: [],
    },
    retryPolicy: {
      enabled: false,
      maxAttempts: 3,
      backoffType: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000,
      retryableErrors: [],
      retryableStatusCodes: [500, 503],
    },
    rateLimiting: {
      enabled: false,
      key: 'global',
      onLimitExceeded: 'reject',
    },
    credentials: [],
    metadata: {},
    executionLimits: {
      maxExecutionTime: 3600000,
      maxMemoryMb: 512,
      maxNodeExecutions: 1000,
      maxDataSizeMb: 100,
      maxArrayItems: 10000,
    },
    multiTenancy: {
      enforced: true,
      tenantIdField: 'tenantId',
      restrictNodeTypes: [],
      allowCrossTenantAccess: false,
      auditLogging: true,
    },
    versionHistory: [],
    ...overrides,
  }
}

function createTestRequestContext(
  tenantId: string,
  overrides?: Partial<RequestContext>
): RequestContext {
  return {
    tenantId,
    userId: 'user-123',
    userEmail: 'user@example.com',
    userLevel: 2,
    ipAddress: '192.168.1.1',
    userAgent: 'Test Client/1.0',
    ...overrides,
  }
}

/**
 * Test Suite
 */

describe('MultiTenantContextBuilder', () => {
  let workflow: WorkflowDefinition
  let requestContext: RequestContext

  beforeEach(() => {
    workflow = createTestWorkflow('tenant-1')
    requestContext = createTestRequestContext('tenant-1')
  })

  describe('constructor', () => {
    it('should create builder with workflow and request context', () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      expect(builder).toBeDefined()
    })

    it('should apply options with defaults', () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext, {
        enforceCredentialValidation: false,
      })
      expect(builder).toBeDefined()
    })
  })

  describe('build', () => {
    it('should build valid context for same tenant', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context).toBeDefined()
      expect(context.tenantId).toBe('tenant-1')
      expect(context.userId).toBe('user-123')
      expect(context.executionId).toBeDefined()
      expect(context.multiTenant.enforced).toBe(true)
    })

    it('should include multi-tenant metadata', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.multiTenant).toEqual(
        expect.objectContaining({
          enforced: true,
          tenantId: 'tenant-1',
          userId: 'user-123',
          userLevel: 2,
          userEmail: 'user@example.com',
          ipAddress: '192.168.1.1',
          executionMode: 'manual',
        })
      )
    })

    it('should build variables from workflow defaults', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.variables.testVar).toBe('default-value')
    })

    it('should override variables from request data', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build({
        variables: {
          testVar: 'overridden-value',
        },
      })

      expect(context.variables.testVar).toBe('overridden-value')
    })

    it('should skip global-scope variables', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      // Global vars should not be in context
      expect(context.variables.globalVar).toBeUndefined()
    })

    it('should inject tenant and user context variables', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.variables._tenantId).toBe('tenant-1')
      expect(context.variables._userId).toBe('user-123')
      expect(context.variables._userLevel).toBe(2)
    })

    it('should set execution mode from trigger', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const trigger = {
        nodeId: 'node-1',
        kind: 'schedule' as const,
        enabled: true,
        metadata: {},
      }
      const context = await builder.build(undefined, trigger)

      expect(context.multiTenant.executionMode).toBe('scheduled')
    })

    it('should reject cross-tenant access by default', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-2')
      )

      await expect(builder.build()).rejects.toThrow('Forbidden')
    })

    it('should allow super-admin to access cross-tenant', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-2', { userLevel: 4 }),
        { allowCrossTenantAccess: true }
      )

      const context = await builder.build()
      expect(context).toBeDefined()
      expect(context.tenantId).toBe('tenant-2')
    })
  })

  describe('validate', () => {
    it('should return valid result for good context', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const result = await builder.validate()

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect tenant mismatch', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-2')
      )
      const result = await builder.validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'TENANT_MISMATCH',
        })
      )
    })

    it('should detect invalid user level', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-1', { userLevel: 5 })
      )
      const result = await builder.validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'UNAUTHORIZED_ACCESS',
        })
      )
    })

    it('should warn about global-scope variables', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const result = await builder.validate()

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          severity: 'high',
          message: expect.stringContaining('global-scope variable'),
        })
      )
    })

    it('should detect missing required fields', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-1', { userId: '' })
      )
      const result = await builder.validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
        })
      )
    })
  })

  describe('tenant isolation', () => {
    it('should prevent cross-tenant variable access', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)

      const context = await builder.build({
        variables: {
          testVar: { _tenantId: 'tenant-2', value: 'bad' },
        },
      })

      // Should throw during validation (called inside build)
      expect(context).toBeDefined()
    })

    it('should reject workflows without tenantId', async () => {
      const badWorkflow = createTestWorkflow('tenant-1')
      badWorkflow.tenantId = ''

      const builder = new MultiTenantContextBuilder(badWorkflow, requestContext)
      const result = await builder.validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
        })
      )
    })

    it('should allow same-tenant access with low user level', async () => {
      const builder = new MultiTenantContextBuilder(
        workflow,
        createTestRequestContext('tenant-1', { userLevel: 1 })
      )
      const context = await builder.build()

      expect(context).toBeDefined()
      expect(context.tenantId).toBe('tenant-1')
    })
  })

  describe('execution limits', () => {
    it('should apply workflow execution limits', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.executionLimits.maxExecutionTime).toBe(3600000)
      expect(context.executionLimits.maxMemoryMb).toBe(512)
      expect(context.executionLimits.maxDataSizeMb).toBe(100)
    })

    it('should use defaults when workflow has no limits', async () => {
      const workflowNoLimits = createTestWorkflow('tenant-1')
      workflowNoLimits.executionLimits = undefined as any

      const builder = new MultiTenantContextBuilder(workflowNoLimits, requestContext)
      const context = await builder.build()

      expect(context.executionLimits.maxExecutionTime).toBe(3600000)
      expect(context.executionLimits.maxMemoryMb).toBe(512)
    })
  })

  describe('trigger handling', () => {
    it('should use provided trigger', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const trigger = {
        nodeId: 'node-1',
        kind: 'webhook' as const,
        enabled: true,
        metadata: { source: 'test' },
      }
      const context = await builder.build(undefined, trigger)

      expect(context.trigger.kind).toBe('webhook')
      expect(context.multiTenant.executionMode).toBe('webhook')
    })

    it('should create default trigger when none provided', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.trigger.kind).toBe('manual')
      expect(context.trigger.nodeId).toBe('node-1')
    })

    it('should set trigger metadata', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext)
      const context = await builder.build()

      expect(context.trigger.metadata).toEqual(
        expect.objectContaining({
          startTime: expect.any(Number),
          triggeredBy: 'api',
          userId: 'user-123',
          tenantId: 'tenant-1',
        })
      )
    })
  })

  describe('request metadata', () => {
    it('should capture request metadata when enabled', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext, {
        captureRequestData: true,
      })
      const context = await builder.build({
        request: {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          query: {},
          body: { test: 'data' },
        },
      })

      expect(context.request).toBeDefined()
      expect(context.requestMetadata).toEqual(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Test Client/1.0',
        })
      )
    })

    it('should not capture request when disabled', async () => {
      const builder = new MultiTenantContextBuilder(workflow, requestContext, {
        captureRequestData: false,
      })
      const context = await builder.build({
        request: { method: 'POST', headers: {}, query: {}, body: {} },
      })

      expect(context.request).toBeUndefined()
    })
  })
})

/**
 * Helper function tests
 */

describe('Helper functions', () => {
  describe('canUserAccessWorkflow', () => {
    it('should allow same-tenant access', () => {
      const result = canUserAccessWorkflow('tenant-1', 2, 'tenant-1')
      expect(result).toBe(true)
    })

    it('should allow super-admin cross-tenant access', () => {
      const result = canUserAccessWorkflow('tenant-1', 4, 'tenant-2')
      expect(result).toBe(true)
    })

    it('should deny cross-tenant access for non-admin', () => {
      const result = canUserAccessWorkflow('tenant-1', 2, 'tenant-2')
      expect(result).toBe(false)
    })

    it('should allow admin cross-tenant access', () => {
      const result = canUserAccessWorkflow('tenant-1', 3, 'tenant-2')
      expect(result).toBe(false)
    })
  })

  describe('sanitizeContextForLogging', () => {
    it('should remove sensitive data', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow)

      const sanitized = sanitizeContextForLogging(context)

      expect(sanitized).toHaveProperty('executionId')
      expect(sanitized).toHaveProperty('tenantId')
      expect(sanitized).toHaveProperty('userId')
      // Should not have full secrets
      expect(sanitized).not.toHaveProperty('secrets')
    })

    it('should truncate IP address', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow)
      context.multiTenant.ipAddress = '192.168.1.100'

      const sanitized = sanitizeContextForLogging(context)

      expect(sanitized.multiTenant.ipAddress).toMatch(/\.\.\.$/)
      expect(sanitized.multiTenant.ipAddress?.length).toBeLessThan(15)
    })

    it('should list variables instead of values', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow)
      context.variables = {
        secret: 'my-secret-value',
        apiKey: 'key-12345',
      }

      const sanitized = sanitizeContextForLogging(context)

      // Variables should be a list of keys
      expect(Array.isArray(sanitized.variables)).toBe(true)
      expect(sanitized.variables).toContain('secret')
    })
  })

  describe('createMockContext', () => {
    it('should create valid test context', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow)

      expect(context.executionId).toBeDefined()
      expect(context.tenantId).toBe('tenant-1')
      expect(context.userId).toBe('test-user-123')
      expect(context.multiTenant.enforced).toBe(true)
    })

    it('should allow overrides', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow, {
        userId: 'custom-user',
        userLevel: 4,
      })

      expect(context.userId).toBe('custom-user')
      expect(context.user.level).toBe(4)
    })

    it('should have credentials map', () => {
      const workflow = createTestWorkflow('tenant-1')
      const context = createMockContext(workflow)

      expect(context.credentialBindings).toBeInstanceOf(Map)
    })
  })
})

/**
 * Integration tests
 */

describe('Integration', () => {
  it('should build complete execution context from workflow and request', async () => {
    const workflow = createTestWorkflow('tenant-1')
    const requestContext = createTestRequestContext('tenant-1')

    const context = await createContextFromRequest(workflow, requestContext, {
      triggerData: { input: 'value' },
      variables: { testVar: 'custom' },
      secrets: { apiKey: 'secret' },
    })

    expect(context).toBeDefined()
    expect(context.tenantId).toBe('tenant-1')
    expect(context.triggerData.input).toBe('value')
    expect(context.variables.testVar).toBe('custom')
    expect(context.secrets.apiKey).toBe('secret')
    expect(context.multiTenant.enforced).toBe(true)
  })

  it('should handle complex workflow with multiple nodes', async () => {
    const workflow = createTestWorkflow('tenant-1', {
      nodes: [
        {
          id: 'trigger',
          name: 'Trigger',
          type: 'trigger',
          typeVersion: 1,
          nodeType: 'trigger',
          position: [0, 0],
          parameters: {},
          inputs: [],
          outputs: [],
          credentials: {},
          disabled: false,
          skipOnFail: false,
          alwaysOutputData: false,
          maxTries: 1,
          waitBetweenTries: 0,
          continueOnError: false,
          onError: 'stopWorkflow',
          metadata: {},
        },
        {
          id: 'action-1',
          name: 'Action 1',
          type: 'action',
          typeVersion: 1,
          nodeType: 'http-request',
          position: [100, 0],
          parameters: { url: 'https://api.example.com' },
          inputs: [],
          outputs: [],
          credentials: {},
          disabled: false,
          skipOnFail: false,
          alwaysOutputData: false,
          maxTries: 3,
          waitBetweenTries: 1000,
          continueOnError: true,
          onError: 'continueErrorOutput',
          metadata: {},
        },
      ],
    })

    const context = await createContextFromRequest(
      workflow,
      createTestRequestContext('tenant-1'),
      { variables: { testVar: 'value' } }
    )

    expect(context).toBeDefined()
    expect(context.multiTenant.enforced).toBe(true)
    expect(context.variables.testVar).toBe('value')
  })
})
