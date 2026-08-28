/**
 * Workflow Error Handler - Production-Ready Error Response Formatter
 *
 * Comprehensive error handling system for workflow execution with:
 * - Structured error codes and HTTP status mapping
 * - User-friendly error messages with recovery suggestions
 * - Diagnostic information with validation errors and hints
 * - Context linking (execution, workflow, node, tenant)
 * - Stack traces in development mode
 * - Support for 30+ error scenarios
 *
 * Follows MetaBuilder patterns:
 * - Multi-tenant safety (tenantId filtering)
 * - Type-safe error responses
 * - Clear separation of development vs production
 * - Comprehensive logging and diagnostics
 */

import type { ValidationError } from '@metabuilder/workflow'

/**
 * Plain API response returned by error handlers.
 * Use NextResponse.json(r.json, { status: r.status }) in actual route handlers.
 */
// The codes and the three tables keyed by them live in ./errors, where a
// test checks they stay in step. Re-exported so callers are unaffected.
import { WorkflowErrorCode } from './errors/error-codes'
import { ERROR_HINTS } from './errors/error-hints'
import { ERROR_MESSAGES } from './errors/error-messages'
import { ERROR_STATUS_MAP } from './errors/error-status'

export { WorkflowErrorCode }

export interface WorkflowApiResponse {
  status: number
  json: FormattedError
  headers?: Map<string, string>
}

/**
 * Error context for linking to execution, workflow, and tenant
 */
export interface ErrorContext {
  executionId?: string
  workflowId?: string
  nodeId?: string
  tenantId?: string
  userId?: string
  action?: string
  timestamp?: Date
  reason?: string
  cause?: Error
  statusCode?: number
  retryable?: boolean
}

/**
 * Diagnostic information for error recovery
 */
export interface ErrorDiagnostics {
  errors?: Array<ValidationError & { suggestion?: string }>
  warnings?: ValidationError[]
  hint?: string
  stack?: string
  context?: Record<string, unknown>
  suggestions?: string[]
}

/**
 * Formatted error response for API responses
 */
export interface FormattedError {
  success: false
  error: {
    code: string
    message: string
    statusCode?: number
    details?: Record<string, unknown>
  }
  context?: {
    executionId?: string
    workflowId?: string
    nodeId?: string
    tenantId?: string
  }
  diagnostics?: ErrorDiagnostics
}

/**
 * Error code definitions covering all 30+ workflow error scenarios
 */
/**
 * HTTP status code mapping for error codes
 */
/**
 * User-friendly error messages
 */
/**
 * Recovery hints and suggestions for each error code
 */
/**
 * WorkflowErrorHandler
 *
 * Production-ready error formatting system for workflow operations.
 * Handles 30+ error codes with structured formatting, diagnostics,
 * and context linking for multi-tenant environments.
 */
export class WorkflowErrorHandler {
  private readonly isDevelopment: boolean

  constructor(isDevelopment: boolean = process.env.NODE_ENV !== 'production') {
    this.isDevelopment = isDevelopment
  }

  /**
   * Handle workflow validation errors
   *
   * Formats validation errors with suggestions and hints
   */
  handleValidationError(
    errors: ValidationError[],
    warnings: ValidationError[] = [],
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    const errorCount = errors.length
    const warningCount = warnings.length

    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.VALIDATION_ERROR,
        message: `Workflow validation failed: ${errorCount} error(s), ${warningCount} warning(s)`,
        statusCode: 400,
        details: {
          errorCount,
          warningCount,
          action: context.action,
        },
      },
      context: {
        workflowId: context.workflowId,
        tenantId: context.tenantId,
      },
      diagnostics: {
        errors: errors.slice(0, 10).map(e => ({
          ...e,
          suggestion: this.getSuggestionForError(e),
        })),
        warnings: warnings.slice(0, 5),
        hint: ERROR_HINTS[WorkflowErrorCode.VALIDATION_ERROR],
        suggestions: this.getRecoverySuggestions(errors),
      },
    }

    return { status: 400, json: response }
  }

  /**
   * Handle execution errors
   *
   * Formats execution errors with diagnostic context
   */
  handleExecutionError(
    error: unknown,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    const code = this.getErrorCode(error)
    const message = this.isDevelopment
      ? this.getErrorMessage(error)
      : ERROR_MESSAGES[code]
    const statusCode = ERROR_STATUS_MAP[code]

    const response: FormattedError = {
      success: false,
      error: {
        code,
        message,
        statusCode,
        details: {
          action: context.action,
          reason: context.reason,
        },
      },
      context: {
        executionId: context.executionId,
        workflowId: context.workflowId,
        nodeId: context.nodeId,
        tenantId: context.tenantId,
      },
    }

    // Add diagnostics in development
    if (this.isDevelopment && context.cause != null) {
      response.diagnostics = {
        stack: context.cause.stack,
        hint: ERROR_HINTS[code],
        context: {
          timestamp: context.timestamp?.toISOString(),
          userId: context.userId,
        },
      }
    } else {
      response.diagnostics = {
        hint: ERROR_HINTS[code],
      }
    }

    return { status: statusCode, json: response }
  }

  /**
   * Handle multi-tenant access control errors
   */
  handleAccessError(context: ErrorContext): WorkflowApiResponse {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.TENANT_MISMATCH,
        message: ERROR_MESSAGES[WorkflowErrorCode.TENANT_MISMATCH],
        statusCode: 403,
        details: {
          reason: context.reason ?? 'Tenant ID mismatch',
        },
      },
      context: {
        workflowId: context.workflowId,
        tenantId: context.tenantId,
      },
      diagnostics: {
        hint: ERROR_HINTS[WorkflowErrorCode.TENANT_MISMATCH],
      },
    }

    return { status: 403, json: response }
  }

  /**
   * Handle authentication/authorization errors
   */
  handleAuthError(
    errorCode: WorkflowErrorCode,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    const statusCode = ERROR_STATUS_MAP[errorCode]

    const response: FormattedError = {
      success: false,
      error: {
        code: errorCode,
        message: ERROR_MESSAGES[errorCode],
        statusCode,
        details: {
          action: context.action,
        },
      },
      diagnostics: {
        hint: ERROR_HINTS[errorCode],
      },
    }

    return { status: statusCode, json: response }
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(
    resource: string,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.NOT_FOUND,
        message: `${resource} not found`,
        statusCode: 404,
        details: { ...context },
      },
      diagnostics: {
        hint: ERROR_HINTS[WorkflowErrorCode.NOT_FOUND],
      },
    }

    return { status: 404, json: response }
  }

  /**
   * Handle rate limiting errors
   */
  handleRateLimitError(
    retryAfter: number = 60,
    _context: ErrorContext = {}
  ): WorkflowApiResponse {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.RATE_LIMITED,
        message: ERROR_MESSAGES[WorkflowErrorCode.RATE_LIMITED],
        statusCode: 429,
        details: {
          retryAfter,
        },
      },
      diagnostics: {
        hint: ERROR_HINTS[WorkflowErrorCode.RATE_LIMITED],
      },
    }

    return {
      status: 429,
      json: response,
      headers: new Map([['Retry-After', String(retryAfter)]]),
    }
  }

  /**
   * Handle resource exhaustion errors (memory, queue, etc)
   */
  handleResourceExhaustedError(
    reason: string = 'Insufficient resources',
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    let errorCode = WorkflowErrorCode.INSUFFICIENT_RESOURCES
    const reasonLower = reason.toLowerCase()
    if (reasonLower.includes('memory') && reasonLower.includes('limit')) {
      errorCode = WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
    } else if (reasonLower.includes('queue')) {
      errorCode = WorkflowErrorCode.EXECUTION_QUEUE_FULL
    }

    const statusCode = ERROR_STATUS_MAP[errorCode]
    const response: FormattedError = {
      success: false,
      error: {
        code: errorCode,
        message: ERROR_MESSAGES[errorCode],
        statusCode,
        details: {
          reason,
        },
      },
      context: {
        executionId: context.executionId,
        workflowId: context.workflowId,
      },
      diagnostics: {
        hint: ERROR_HINTS[errorCode],
      },
    }

    return { status: statusCode, json: response }
  }

  /**
   * Handle timeout errors
   */
  handleTimeoutError(context: ErrorContext = {}): WorkflowApiResponse {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.EXECUTION_TIMEOUT,
        message: ERROR_MESSAGES[WorkflowErrorCode.EXECUTION_TIMEOUT],
        statusCode: 504,
        details: {
          executionId: context.executionId,
          nodeId: context.nodeId,
        },
      },
      context: {
        executionId: context.executionId,
        workflowId: context.workflowId,
        nodeId: context.nodeId,
      },
      diagnostics: {
        hint: ERROR_HINTS[WorkflowErrorCode.EXECUTION_TIMEOUT],
      },
    }

    return { status: 504, json: response }
  }

  /**
   * Determine error code from error object
   */
  private getErrorCode(error: unknown): WorkflowErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('validation'))
        return WorkflowErrorCode.VALIDATION_ERROR
      if (message.includes('timeout'))
        return WorkflowErrorCode.EXECUTION_TIMEOUT
      if (message.includes('not found')) return WorkflowErrorCode.NOT_FOUND
      if (message.includes('forbidden')) return WorkflowErrorCode.FORBIDDEN
      if (message.includes('unauthorized'))
        return WorkflowErrorCode.UNAUTHORIZED
      if (message.includes('node not found'))
        return WorkflowErrorCode.NODE_NOT_FOUND
      if (message.includes('circular'))
        return WorkflowErrorCode.CIRCULAR_DEPENDENCY
      if (message.includes('duplicate'))
        return WorkflowErrorCode.DUPLICATE_NODE_NAME
      if (message.includes('tenant')) return WorkflowErrorCode.TENANT_MISMATCH
      if (message.includes('memory'))
        return WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
    }

    return WorkflowErrorCode.UNKNOWN_ERROR
  }

  /**
   * Get error message from error object
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }

  /**
   * Get suggestion for validation error
   */
  private getSuggestionForError(error: ValidationError): string {
    const code = error.code.toUpperCase()
    const suggestions: Record<string, string> = {
      MISSING_REQUIRED_FIELD: 'Add the missing parameter to the node.',
      INVALID_NODE_TYPE: 'Use a valid node type from the registry.',
      INVALID_CONNECTION_TARGET_NODE: 'Ensure target node exists in workflow.',
      TYPE_MISMATCH: 'Change parameter type to match definition.',
      MISSING_TENANT_ID: 'Workflow must belong to a tenant.',
      TIMEOUT_TOO_SHORT: 'Increase timeout for more reliable execution.',
      DUPLICATE_NODE_NAME: 'Use unique names for all nodes.',
      CIRCULAR_DEPENDENCY: 'Remove circular connections between nodes.',
    }

    return suggestions[code] ?? 'Fix this validation issue and retry.'
  }

  /**
   * Get recovery suggestions based on validation errors
   */
  private getRecoverySuggestions(errors: ValidationError[]): string[] {
    const suggestions = new Set<string>()

    for (const error of errors) {
      const suggestion = this.getSuggestionForError(error)
      if (suggestion !== '') {
        suggestions.add(suggestion)
      }
    }

    return Array.from(suggestions).slice(0, 5)
  }
}

/**
 * Global error handler instance
 */
let globalHandler: WorkflowErrorHandler | null = null

/**
 * Get or create global error handler instance
 */
export function getWorkflowErrorHandler(
  isDevelopment?: boolean
): WorkflowErrorHandler {
  globalHandler ??= new WorkflowErrorHandler(isDevelopment)
  return globalHandler
}

/**
 * Reset global error handler (for testing)
 */
export function resetWorkflowErrorHandler(): void {
  globalHandler = null
}
