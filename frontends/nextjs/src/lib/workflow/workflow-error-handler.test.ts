/**
 * WorkflowErrorHandler Tests
 *
 * Comprehensive test suite covering:
 * - All 30+ error codes
 * - HTTP status code mappings
 * - Error message formatting
 * - Context linking and diagnostics
 * - Development vs production modes
 * - Recovery suggestions and hints
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  WorkflowErrorHandler,
  WorkflowErrorCode,
  getWorkflowErrorHandler,
  resetWorkflowErrorHandler,
} from './workflow-error-handler'
import type { ValidationError } from '@metabuilder/workflow'

describe('WorkflowErrorHandler', () => {
  let handler: WorkflowErrorHandler

  beforeEach(() => {
    resetWorkflowErrorHandler()
    handler = new WorkflowErrorHandler(true) // Development mode
  })

  describe('initialization', () => {
    it('should create error handler in development mode', () => {
      const devHandler = new WorkflowErrorHandler(true)
      expect(devHandler).toBeDefined()
    })

    it('should create error handler in production mode', () => {
      const prodHandler = new WorkflowErrorHandler(false)
      expect(prodHandler).toBeDefined()
    })

    it('should return global singleton instance', () => {
      const handler1 = getWorkflowErrorHandler()
      const handler2 = getWorkflowErrorHandler()
      expect(handler1).toBe(handler2)
    })

    it('should reset global instance', () => {
      const handler1 = getWorkflowErrorHandler()
      resetWorkflowErrorHandler()
      const handler2 = getWorkflowErrorHandler()
      expect(handler1).not.toBe(handler2)
    })
  })

  describe('validation errors', () => {
    it('should handle VALIDATION_ERROR', () => {
      const validationErrors: ValidationError[] = [
        {
          path: 'root.nodes[0]',
          message: 'Node type is invalid',
          code: 'INVALID_NODE_TYPE',
          severity: 'error',
        },
      ]

      const response = handler.handleValidationError(validationErrors, [], {
        workflowId: 'wf-123',
        tenantId: 'tenant-1',
      })

      expect(response.status).toBe(400)
      const body = response.json as any
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(WorkflowErrorCode.VALIDATION_ERROR)
    })

    it('should include validation errors in diagnostics', () => {
      const validationErrors: ValidationError[] = [
        {
          path: 'root.nodes[0].parameters',
          message: 'Missing required parameter',
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
        },
      ]

      const response = handler.handleValidationError(validationErrors)
      const body = response.json as any

      expect(body.diagnostics.errors).toHaveLength(1)
      expect(body.diagnostics.errors[0].suggestion).toBeDefined()
    })

    it('should handle validation warnings', () => {
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = [
        {
          path: 'root.nodes[0]',
          message: 'Node timeout is very short',
          code: 'TIMEOUT_TOO_SHORT',
          severity: 'warning',
        },
      ]

      const response = handler.handleValidationError(errors, warnings, {
        action: 'validate_workflow',
      })

      const body = response.json as any
      expect(body.diagnostics.warnings).toHaveLength(1)
    })

    it.each<[string, string]>([
      ['MISSING_REQUIRED_FIELD', 'Add the missing parameter'],
      ['INVALID_NODE_TYPE', 'Use a valid node type'],
      ['TYPE_MISMATCH', 'Change parameter type'],
      ['DUPLICATE_NODE_NAME', 'Use unique names'],
      ['CIRCULAR_DEPENDENCY', 'Remove circular connections'],
    ])('should suggest fix for %s', (code, expectedSuggestion) => {
      const validationErrors: ValidationError[] = [
        {
          path: 'root',
          message: 'Test error',
          code,
          severity: 'error',
        },
      ]

      const response = handler.handleValidationError(validationErrors)
      const body = response.json as any

      expect(body.diagnostics.errors[0].suggestion).toContain(expectedSuggestion)
    })
  })

  describe('execution errors', () => {
    it('should handle EXECUTION_ERROR', () => {
      const error = new Error('Node execution failed')

      const response = handler.handleExecutionError(error, {
        workflowId: 'wf-123',
        nodeId: 'node-1',
        executionId: 'exec-123',
      })

      expect(response.status).toBe(500)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.UNKNOWN_ERROR)
    })

    it('should detect EXECUTION_TIMEOUT', () => {
      const error = new Error('Node execution timeout after 5000ms')

      const response = handler.handleExecutionError(error)
      const body = response.json as any

      expect(body.error.code).toBe(WorkflowErrorCode.EXECUTION_TIMEOUT)
      expect(response.status).toBe(504)
    })

    it('should include execution context in response', () => {
      const error = new Error('Execution failed')

      const response = handler.handleExecutionError(error, {
        executionId: 'exec-123',
        workflowId: 'wf-123',
        nodeId: 'node-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
      })

      const body = response.json as any
      expect(body.context.executionId).toBe('exec-123')
      expect(body.context.workflowId).toBe('wf-123')
      expect(body.context.nodeId).toBe('node-1')
      expect(body.context.tenantId).toBe('tenant-1')
    })

    it('should include stack trace in development mode', () => {
      const error = new Error('Test error')

      const response = handler.handleExecutionError(error, {
        cause: error,
      })

      const body = response.json as any
      expect(body.diagnostics.stack).toBeDefined()
    })

    it('should omit stack trace in production mode', () => {
      const prodHandler = new WorkflowErrorHandler(false)
      const error = new Error('Test error')

      const response = prodHandler.handleExecutionError(error, {
        cause: error,
      })

      const body = response.json as any
      expect(body.diagnostics.stack).toBeUndefined()
    })
  })

  describe('access control errors', () => {
    it('should handle TENANT_MISMATCH', () => {
      const response = handler.handleAccessError({
        workflowId: 'wf-123',
        tenantId: 'tenant-2',
        reason: 'User tenant (tenant-1) does not match workflow tenant (tenant-2)',
      })

      expect(response.status).toBe(403)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.TENANT_MISMATCH)
    })

    it('should handle UNAUTHORIZED', () => {
      const response = handler.handleAuthError(WorkflowErrorCode.UNAUTHORIZED)

      expect(response.status).toBe(401)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.UNAUTHORIZED)
    })

    it('should handle FORBIDDEN', () => {
      const response = handler.handleAuthError(WorkflowErrorCode.FORBIDDEN)

      expect(response.status).toBe(403)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.FORBIDDEN)
    })

    it('should handle PERMISSION_DENIED', () => {
      const response = handler.handleAuthError(WorkflowErrorCode.PERMISSION_DENIED, {
        action: 'execute_workflow',
      })

      expect(response.status).toBe(403)
      const body = response.json as any
      expect(body.error.message).toContain('Permission')
    })
  })

  describe('not found errors', () => {
    it('should handle WORKFLOW_NOT_FOUND', () => {
      const response = handler.handleNotFoundError('Workflow', {
        workflowId: 'wf-123',
      })

      expect(response.status).toBe(404)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.NOT_FOUND)
    })

    it('should handle EXECUTION_NOT_FOUND', () => {
      const response = handler.handleNotFoundError('Execution', {
        executionId: 'exec-123',
      })

      expect(response.status).toBe(404)
      const body = response.json as any
      expect(body.error.message).toContain('Execution')
    })

    it('should include resource details in context', () => {
      const response = handler.handleNotFoundError('Node', {
        nodeId: 'node-456',
        workflowId: 'wf-123',
      })

      const body = response.json as any
      expect(body.error.details.nodeId).toBe('node-456')
    })
  })

  describe('rate limiting errors', () => {
    it('should handle RATE_LIMITED with retry-after header', () => {
      const response = handler.handleRateLimitError(60)

      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('60')

      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.RATE_LIMITED)
      expect(body.error.details.retryAfter).toBe(60)
    })

    it('should use default retry-after if not provided', () => {
      const response = handler.handleRateLimitError()

      const body = response.json as any
      expect(body.error.details.retryAfter).toBe(60)
    })

    it('should handle CONCURRENT_EXECUTION_LIMIT', () => {
      const response = handler.handleResourceExhaustedError('Execution queue is full')

      expect(response.status).toBe(429)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.EXECUTION_QUEUE_FULL)
    })
  })

  describe('resource exhaustion errors', () => {
    it('should handle INSUFFICIENT_RESOURCES', () => {
      const response = handler.handleResourceExhaustedError('Not enough memory')

      expect(response.status).toBe(503)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.INSUFFICIENT_RESOURCES)
    })

    it('should detect MEMORY_LIMIT_EXCEEDED', () => {
      const response = handler.handleResourceExhaustedError(
        'Memory limit exceeded: 2GB > 1GB'
      )

      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED)
    })

    it('should detect EXECUTION_QUEUE_FULL', () => {
      const response = handler.handleResourceExhaustedError(
        'Execution queue is full (500/500)'
      )

      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.EXECUTION_QUEUE_FULL)
    })
  })

  describe('timeout errors', () => {
    it('should handle EXECUTION_TIMEOUT', () => {
      const response = handler.handleTimeoutError({
        executionId: 'exec-123',
        workflowId: 'wf-123',
        nodeId: 'node-1',
      })

      expect(response.status).toBe(504)
      const body = response.json as any
      expect(body.error.code).toBe(WorkflowErrorCode.EXECUTION_TIMEOUT)
    })

    it('should include timeout context', () => {
      const response = handler.handleTimeoutError({
        executionId: 'exec-123',
        nodeId: 'node-1',
      })

      const body = response.json as any
      expect(body.context.executionId).toBe('exec-123')
      expect(body.context.nodeId).toBe('node-1')
    })
  })

  describe('HTTP status code mapping', () => {
    it.each<[WorkflowErrorCode, number]>([
      [WorkflowErrorCode.VALIDATION_ERROR, 400],
      [WorkflowErrorCode.MISSING_TENANT_ID, 400],
      [WorkflowErrorCode.UNAUTHORIZED, 401],
      [WorkflowErrorCode.FORBIDDEN, 403],
      [WorkflowErrorCode.NOT_FOUND, 404],
      [WorkflowErrorCode.RATE_LIMITED, 429],
      [WorkflowErrorCode.EXECUTION_ERROR, 500],
      [WorkflowErrorCode.EXECUTION_TIMEOUT, 504],
      [WorkflowErrorCode.INSUFFICIENT_RESOURCES, 503],
    ])(
      'should map %s to HTTP %d',
      (errorCode: WorkflowErrorCode, expectedStatus: number) => {
        const response = handler.handleAuthError(errorCode)
        expect(response.status).toBe(expectedStatus)
      }
    )
  })

  describe('error codes enumeration', () => {
    it('should have all 30+ error codes defined', () => {
      const codes = Object.values(WorkflowErrorCode)
      expect(codes.length).toBeGreaterThanOrEqual(30)
    })

    it('should include validation error codes', () => {
      expect(WorkflowErrorCode.VALIDATION_ERROR).toBeDefined()
      expect(WorkflowErrorCode.MISSING_REQUIRED_FIELD).toBeDefined()
      expect(WorkflowErrorCode.INVALID_NODE_TYPE).toBeDefined()
      expect(WorkflowErrorCode.CIRCULAR_DEPENDENCY).toBeDefined()
      expect(WorkflowErrorCode.DUPLICATE_NODE_NAME).toBeDefined()
    })

    it('should include execution error codes', () => {
      expect(WorkflowErrorCode.EXECUTION_ERROR).toBeDefined()
      expect(WorkflowErrorCode.NODE_EXECUTION_FAILED).toBeDefined()
      expect(WorkflowErrorCode.EXECUTION_TIMEOUT).toBeDefined()
      expect(WorkflowErrorCode.NODE_NOT_FOUND).toBeDefined()
    })

    it('should include access control error codes', () => {
      expect(WorkflowErrorCode.FORBIDDEN).toBeDefined()
      expect(WorkflowErrorCode.UNAUTHORIZED).toBeDefined()
      expect(WorkflowErrorCode.TENANT_MISMATCH).toBeDefined()
      expect(WorkflowErrorCode.PERMISSION_DENIED).toBeDefined()
    })

    it('should include resource error codes', () => {
      expect(WorkflowErrorCode.INSUFFICIENT_RESOURCES).toBeDefined()
      expect(WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED).toBeDefined()
      expect(WorkflowErrorCode.EXECUTION_QUEUE_FULL).toBeDefined()
    })
  })

  describe('recovery hints', () => {
    it('should provide hints for all error codes', () => {
      const codes = Object.values(WorkflowErrorCode)

      for (const code of codes) {
        const response = handler.handleAuthError(code as WorkflowErrorCode)
        const body = response.json as any
        expect(body.diagnostics.hint).toBeDefined()
        expect(body.diagnostics.hint.length).toBeGreaterThan(0)
      }
    })

    it('should provide actionable hints', () => {
      const response = handler.handleValidationError(
        [
          {
            path: 'root.nodes[0]',
            message: 'Missing parameter',
            code: 'MISSING_REQUIRED_FIELD',
            severity: 'error',
          },
        ],
        []
      )

      const body = response.json as any
      expect(body.diagnostics.hint).toContain('workflow')
    })
  })

  describe('error message formatting', () => {
    it('should have user-friendly messages', () => {
      const response = handler.handleAuthError(WorkflowErrorCode.VALIDATION_ERROR)
      const body = response.json as any
      expect(body.error.message).toBeDefined()
      expect(body.error.message.length).toBeGreaterThan(0)
    })

    it('should not expose implementation details in production', () => {
      const prodHandler = new WorkflowErrorHandler(false)
      const error = new Error('Internal database connection failed')

      const response = prodHandler.handleExecutionError(error)
      const body = response.json as any

      // Production should use generic message
      expect(body.error.message).not.toContain('database')
      expect(body.error.message).not.toContain('connection')
    })

    it('should expose implementation details in development', () => {
      const error = new Error('Invalid workflow structure')

      const response = handler.handleExecutionError(error)
      const body = response.json as any

      expect(body.error.message).toContain('Invalid workflow')
    })
  })

  describe('response structure', () => {
    it('should have success: false in all error responses', () => {
      const validationResponse = handler.handleValidationError([])
      const body1 = validationResponse.json as any
      expect(body1.success).toBe(false)

      const executionResponse = handler.handleExecutionError(new Error('test'))
      const body2 = executionResponse.json as any
      expect(body2.success).toBe(false)
    })

    it('should include error.code in all responses', () => {
      const response = handler.handleNotFoundError('Test')
      const body = response.json as any
      expect(body.error.code).toBeDefined()
    })

    it('should include error.message in all responses', () => {
      const response = handler.handleTimeoutError()
      const body = response.json as any
      expect(body.error.message).toBeDefined()
    })

    it('should include error.statusCode in all responses', () => {
      const response = handler.handleRateLimitError()
      const body = response.json as any
      expect(body.error.statusCode).toBe(429)
    })

    it('should include context when provided', () => {
      const response = handler.handleExecutionError(new Error('test'), {
        workflowId: 'wf-1',
        tenantId: 'tenant-1',
      })

      const body = response.json as any
      expect(body.context.workflowId).toBe('wf-1')
      expect(body.context.tenantId).toBe('tenant-1')
    })

    it('should include diagnostics with hints', () => {
      const response = handler.handleTimeoutError()
      const body = response.json as any
      expect(body.diagnostics).toBeDefined()
      expect(body.diagnostics.hint).toBeDefined()
    })
  })

  describe('multi-tenant safety', () => {
    it('should enforce tenant context in access errors', () => {
      const response = handler.handleAccessError({
        tenantId: 'tenant-1',
        workflowId: 'wf-123',
      })

      const body = response.json as any
      expect(body.context.tenantId).toBe('tenant-1')
    })

    it('should support different tenants in parallel', () => {
      const response1 = handler.handleAccessError({
        tenantId: 'tenant-1',
      })

      const response2 = handler.handleAccessError({
        tenantId: 'tenant-2',
      })

      const body1 = response1.json as any
      const body2 = response2.json as any

      expect(body1.context.tenantId).toBe('tenant-1')
      expect(body2.context.tenantId).toBe('tenant-2')
    })
  })
})
