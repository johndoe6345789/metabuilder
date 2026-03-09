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

import { NextResponse } from 'next/server'
import type { ValidationError } from '@metabuilder/workflow'

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
  context?: Record<string, any>
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
    details?: Record<string, any>
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
export enum WorkflowErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_NODE_TYPE = 'INVALID_NODE_TYPE',
  INVALID_CONNECTION = 'INVALID_CONNECTION',
  INVALID_WORKFLOW_STRUCTURE = 'INVALID_WORKFLOW_STRUCTURE',
  DUPLICATE_NODE_NAME = 'DUPLICATE_NODE_NAME',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  INVALID_TENANT_ID = 'INVALID_TENANT_ID',
  MISSING_TENANT_ID = 'MISSING_TENANT_ID',

  // Execution errors (500)
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  NODE_EXECUTION_FAILED = 'NODE_EXECUTION_FAILED',
  EXECUTION_TIMEOUT = 'EXECUTION_TIMEOUT',
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  EXECUTOR_NOT_REGISTERED = 'EXECUTOR_NOT_REGISTERED',
  WORKFLOW_EXECUTION_ABORTED = 'WORKFLOW_EXECUTION_ABORTED',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  EXECUTION_QUEUE_FULL = 'EXECUTION_QUEUE_FULL',

  // Data/Configuration errors (422)
  MISSING_WORKFLOW_DEFINITION = 'MISSING_WORKFLOW_DEFINITION',
  INVALID_WORKFLOW_FORMAT = 'INVALID_WORKFLOW_FORMAT',
  INVALID_CONTEXT = 'INVALID_CONTEXT',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MISSING_VARIABLE = 'MISSING_VARIABLE',
  INVALID_EXPRESSION = 'INVALID_EXPRESSION',

  // Access control errors (403)
  FORBIDDEN = 'FORBIDDEN',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  UNAUTHORIZED = 'UNAUTHORIZED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  EXECUTION_NOT_FOUND = 'EXECUTION_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMITED = 'RATE_LIMITED',
  CONCURRENT_EXECUTION_LIMIT = 'CONCURRENT_EXECUTION_LIMIT',

  // Unknown/Generic errors (500)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<WorkflowErrorCode, number> = {
  // Validation errors (400)
  [WorkflowErrorCode.VALIDATION_ERROR]: 400,
  [WorkflowErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [WorkflowErrorCode.INVALID_NODE_TYPE]: 400,
  [WorkflowErrorCode.INVALID_CONNECTION]: 400,
  [WorkflowErrorCode.INVALID_WORKFLOW_STRUCTURE]: 400,
  [WorkflowErrorCode.DUPLICATE_NODE_NAME]: 400,
  [WorkflowErrorCode.CIRCULAR_DEPENDENCY]: 400,
  [WorkflowErrorCode.TYPE_MISMATCH]: 400,
  [WorkflowErrorCode.INVALID_TENANT_ID]: 400,
  [WorkflowErrorCode.MISSING_TENANT_ID]: 400,

  // Execution errors (500)
  [WorkflowErrorCode.EXECUTION_ERROR]: 500,
  [WorkflowErrorCode.EXECUTION_FAILED]: 500,
  [WorkflowErrorCode.NODE_EXECUTION_FAILED]: 500,
  [WorkflowErrorCode.EXECUTION_TIMEOUT]: 504,
  [WorkflowErrorCode.NODE_NOT_FOUND]: 500,
  [WorkflowErrorCode.EXECUTOR_NOT_REGISTERED]: 500,
  [WorkflowErrorCode.WORKFLOW_EXECUTION_ABORTED]: 500,
  [WorkflowErrorCode.INSUFFICIENT_RESOURCES]: 503,
  [WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED]: 503,
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]: 503,

  // Data/Configuration errors (422)
  [WorkflowErrorCode.MISSING_WORKFLOW_DEFINITION]: 422,
  [WorkflowErrorCode.INVALID_WORKFLOW_FORMAT]: 422,
  [WorkflowErrorCode.INVALID_CONTEXT]: 422,
  [WorkflowErrorCode.INVALID_PARAMETER]: 422,
  [WorkflowErrorCode.MISSING_VARIABLE]: 422,
  [WorkflowErrorCode.INVALID_EXPRESSION]: 422,

  // Access control errors (403)
  [WorkflowErrorCode.FORBIDDEN]: 403,
  [WorkflowErrorCode.TENANT_MISMATCH]: 403,
  [WorkflowErrorCode.UNAUTHORIZED]: 401,
  [WorkflowErrorCode.PERMISSION_DENIED]: 403,

  // Not found errors (404)
  [WorkflowErrorCode.NOT_FOUND]: 404,
  [WorkflowErrorCode.WORKFLOW_NOT_FOUND]: 404,
  [WorkflowErrorCode.EXECUTION_NOT_FOUND]: 404,
  [WorkflowErrorCode.RESOURCE_NOT_FOUND]: 404,

  // Rate limiting (429)
  [WorkflowErrorCode.RATE_LIMITED]: 429,
  [WorkflowErrorCode.CONCURRENT_EXECUTION_LIMIT]: 429,

  // Unknown/Generic errors (500)
  [WorkflowErrorCode.UNKNOWN_ERROR]: 500,
  [WorkflowErrorCode.INTERNAL_SERVER_ERROR]: 500,
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<WorkflowErrorCode, string> = {
  // Validation
  [WorkflowErrorCode.VALIDATION_ERROR]: 'Workflow validation failed',
  [WorkflowErrorCode.MISSING_REQUIRED_FIELD]: 'Missing required field in workflow definition',
  [WorkflowErrorCode.INVALID_NODE_TYPE]: 'Invalid node type specified',
  [WorkflowErrorCode.INVALID_CONNECTION]: 'Invalid connection between nodes',
  [WorkflowErrorCode.INVALID_WORKFLOW_STRUCTURE]: 'Workflow structure is invalid',
  [WorkflowErrorCode.DUPLICATE_NODE_NAME]: 'Duplicate node name detected',
  [WorkflowErrorCode.CIRCULAR_DEPENDENCY]: 'Circular dependency detected in workflow',
  [WorkflowErrorCode.TYPE_MISMATCH]: 'Type mismatch in node parameters',
  [WorkflowErrorCode.INVALID_TENANT_ID]: 'Invalid tenant ID format',
  [WorkflowErrorCode.MISSING_TENANT_ID]: 'Tenant ID is required',

  // Execution
  [WorkflowErrorCode.EXECUTION_ERROR]: 'Workflow execution failed',
  [WorkflowErrorCode.EXECUTION_FAILED]: 'Workflow execution failed',
  [WorkflowErrorCode.NODE_EXECUTION_FAILED]: 'Node execution failed',
  [WorkflowErrorCode.EXECUTION_TIMEOUT]: 'Workflow execution timed out',
  [WorkflowErrorCode.NODE_NOT_FOUND]: 'Node not found in workflow',
  [WorkflowErrorCode.EXECUTOR_NOT_REGISTERED]: 'Node executor not registered',
  [WorkflowErrorCode.WORKFLOW_EXECUTION_ABORTED]: 'Workflow execution was aborted',
  [WorkflowErrorCode.INSUFFICIENT_RESOURCES]: 'Insufficient resources to execute workflow',
  [WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED]: 'Memory limit exceeded during execution',
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]: 'Execution queue is full, please try again later',

  // Data/Configuration
  [WorkflowErrorCode.MISSING_WORKFLOW_DEFINITION]: 'Workflow definition is required',
  [WorkflowErrorCode.INVALID_WORKFLOW_FORMAT]: 'Workflow format is invalid',
  [WorkflowErrorCode.INVALID_CONTEXT]: 'Invalid execution context',
  [WorkflowErrorCode.INVALID_PARAMETER]: 'Invalid parameter value',
  [WorkflowErrorCode.MISSING_VARIABLE]: 'Required variable is missing',
  [WorkflowErrorCode.INVALID_EXPRESSION]: 'Invalid expression syntax',

  // Access control
  [WorkflowErrorCode.FORBIDDEN]: 'Access to workflow is forbidden',
  [WorkflowErrorCode.TENANT_MISMATCH]: 'Tenant mismatch - cannot access workflow',
  [WorkflowErrorCode.UNAUTHORIZED]: 'Unauthorized - authentication required',
  [WorkflowErrorCode.PERMISSION_DENIED]: 'Permission denied for this action',

  // Not found
  [WorkflowErrorCode.NOT_FOUND]: 'Resource not found',
  [WorkflowErrorCode.WORKFLOW_NOT_FOUND]: 'Workflow not found',
  [WorkflowErrorCode.EXECUTION_NOT_FOUND]: 'Execution not found',
  [WorkflowErrorCode.RESOURCE_NOT_FOUND]: 'Requested resource not found',

  // Rate limiting
  [WorkflowErrorCode.RATE_LIMITED]: 'Too many requests, please try again later',
  [WorkflowErrorCode.CONCURRENT_EXECUTION_LIMIT]: 'Concurrent execution limit reached',

  // Generic
  [WorkflowErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
  [WorkflowErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
}

/**
 * Recovery hints and suggestions for each error code
 */
const ERROR_HINTS: Record<WorkflowErrorCode, string> = {
  [WorkflowErrorCode.VALIDATION_ERROR]:
    'Verify workflow structure, check nodes, connections, and parameters.',
  [WorkflowErrorCode.MISSING_REQUIRED_FIELD]: 'Ensure all required fields are populated.',
  [WorkflowErrorCode.INVALID_NODE_TYPE]:
    'Use a node type from the available registry. Check the workflow editor.',
  [WorkflowErrorCode.INVALID_CONNECTION]:
    'Ensure target node exists and input/output types are compatible.',
  [WorkflowErrorCode.INVALID_WORKFLOW_STRUCTURE]:
    'Review workflow layout and ensure proper node organization.',
  [WorkflowErrorCode.DUPLICATE_NODE_NAME]: 'Rename nodes to have unique names.',
  [WorkflowErrorCode.CIRCULAR_DEPENDENCY]:
    'Reorganize workflow to eliminate circular references.',
  [WorkflowErrorCode.TYPE_MISMATCH]:
    'Verify parameter types match node input requirements.',
  [WorkflowErrorCode.INVALID_TENANT_ID]: 'Use a valid tenant ID format.',
  [WorkflowErrorCode.MISSING_TENANT_ID]:
    'Workflow must be associated with a tenant.',
  [WorkflowErrorCode.EXECUTION_ERROR]:
    'Check node parameters and verify target resources are available.',
  [WorkflowErrorCode.EXECUTION_FAILED]:
    'Review execution logs for more details about the failure.',
  [WorkflowErrorCode.NODE_EXECUTION_FAILED]:
    'Check the node configuration and input data.',
  [WorkflowErrorCode.EXECUTION_TIMEOUT]:
    'Increase timeout settings or optimize the workflow for performance.',
  [WorkflowErrorCode.NODE_NOT_FOUND]:
    'Verify the node exists in the workflow definition.',
  [WorkflowErrorCode.EXECUTOR_NOT_REGISTERED]:
    'The required node executor is not available.',
  [WorkflowErrorCode.WORKFLOW_EXECUTION_ABORTED]:
    'Execution was aborted. Review the abort reason and retry.',
  [WorkflowErrorCode.INSUFFICIENT_RESOURCES]:
    'System does not have sufficient resources. Try again later.',
  [WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED]:
    'Reduce workflow complexity or data size.',
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]: 'Wait a moment and retry the execution.',
  [WorkflowErrorCode.MISSING_WORKFLOW_DEFINITION]:
    'Provide a valid workflow definition.',
  [WorkflowErrorCode.INVALID_WORKFLOW_FORMAT]: 'Ensure workflow format is correct.',
  [WorkflowErrorCode.INVALID_CONTEXT]:
    'Verify execution context (user, tenant, variables).',
  [WorkflowErrorCode.INVALID_PARAMETER]:
    'Check parameter values and types in node configuration.',
  [WorkflowErrorCode.MISSING_VARIABLE]:
    'Ensure all referenced variables are defined.',
  [WorkflowErrorCode.INVALID_EXPRESSION]:
    'Review expression syntax and variable references.',
  [WorkflowErrorCode.FORBIDDEN]: 'Contact your administrator for access.',
  [WorkflowErrorCode.TENANT_MISMATCH]:
    'Workflow belongs to a different tenant. Check access permissions.',
  [WorkflowErrorCode.UNAUTHORIZED]: 'Log in again or refresh your credentials.',
  [WorkflowErrorCode.PERMISSION_DENIED]:
    'Contact your administrator for required permissions.',
  [WorkflowErrorCode.NOT_FOUND]: 'Verify the resource exists and is accessible.',
  [WorkflowErrorCode.WORKFLOW_NOT_FOUND]: 'Workflow has been deleted or is inaccessible.',
  [WorkflowErrorCode.EXECUTION_NOT_FOUND]:
    'Execution record not found. Check the execution ID.',
  [WorkflowErrorCode.RESOURCE_NOT_FOUND]:
    'The requested resource no longer exists.',
  [WorkflowErrorCode.RATE_LIMITED]: 'Wait a moment and retry the request.',
  [WorkflowErrorCode.CONCURRENT_EXECUTION_LIMIT]:
    'Too many workflows running simultaneously. Try again later.',
  [WorkflowErrorCode.UNKNOWN_ERROR]: 'Check logs for more information.',
  [WorkflowErrorCode.INTERNAL_SERVER_ERROR]:
    'The server encountered an error. Our team has been notified.',
}

/**
 * WorkflowErrorHandler
 *
 * Production-ready error formatting system for workflow operations.
 * Handles 30+ error codes with structured formatting, diagnostics,
 * and context linking for multi-tenant environments.
 */
export class WorkflowErrorHandler {
  private isDevelopment: boolean

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
  ): NextResponse<FormattedError> {
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
        errors: errors.slice(0, 10).map((e) => ({
          ...e,
          suggestion: this.getSuggestionForError(e),
        })),
        warnings: warnings.slice(0, 5),
        hint: ERROR_HINTS[WorkflowErrorCode.VALIDATION_ERROR],
        suggestions: this.getRecoverySuggestions(errors),
      },
    }

    return NextResponse.json(response, { status: 400 })
  }

  /**
   * Handle execution errors
   *
   * Formats execution errors with diagnostic context
   */
  handleExecutionError(
    error: unknown,
    context: ErrorContext = {}
  ): NextResponse<FormattedError> {
    const code = this.getErrorCode(error)
    const message = ERROR_MESSAGES[code] || this.getErrorMessage(error)
    const statusCode = ERROR_STATUS_MAP[code] || 500

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
    if (this.isDevelopment && context.cause) {
      response.diagnostics = {
        stack: context.cause.stack,
        hint: ERROR_HINTS[code as WorkflowErrorCode],
        context: {
          timestamp: context.timestamp?.toISOString(),
          userId: context.userId,
        },
      }
    } else {
      response.diagnostics = {
        hint: ERROR_HINTS[code as WorkflowErrorCode],
      }
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Handle multi-tenant access control errors
   */
  handleAccessError(context: ErrorContext): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.TENANT_MISMATCH,
        message: ERROR_MESSAGES[WorkflowErrorCode.TENANT_MISMATCH],
        statusCode: 403,
        details: {
          reason: context.reason || 'Tenant ID mismatch',
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

    return NextResponse.json(response, { status: 403 })
  }

  /**
   * Handle authentication/authorization errors
   */
  handleAuthError(
    errorCode: WorkflowErrorCode,
    context: ErrorContext = {}
  ): NextResponse<FormattedError> {
    const statusCode = ERROR_STATUS_MAP[errorCode] || 401

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

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(
    resource: string,
    context: ErrorContext = {}
  ): NextResponse<FormattedError> {
    const response: FormattedError = {
      success: false,
      error: {
        code: WorkflowErrorCode.NOT_FOUND,
        message: `${resource} not found`,
        statusCode: 404,
        details: context,
      },
      diagnostics: {
        hint: ERROR_HINTS[WorkflowErrorCode.NOT_FOUND],
      },
    }

    return NextResponse.json(response, { status: 404 })
  }

  /**
   * Handle rate limiting errors
   */
  handleRateLimitError(
    retryAfter: number = 60,
    _context: ErrorContext = {}
  ): NextResponse<FormattedError> {
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

    const nextResponse = NextResponse.json(response, { status: 429 })
    nextResponse.headers.set('Retry-After', String(retryAfter))
    return nextResponse
  }

  /**
   * Handle resource exhaustion errors (memory, queue, etc)
   */
  handleResourceExhaustedError(
    reason: string = 'Insufficient resources',
    context: ErrorContext = {}
  ): NextResponse<FormattedError> {
    let errorCode = WorkflowErrorCode.INSUFFICIENT_RESOURCES
    if (reason.includes('memory')) {
      errorCode = WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
    } else if (reason.includes('queue')) {
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

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Handle timeout errors
   */
  handleTimeoutError(context: ErrorContext = {}): NextResponse<FormattedError> {
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

    return NextResponse.json(response, { status: 504 })
  }

  /**
   * Determine error code from error object
   */
  private getErrorCode(error: unknown): WorkflowErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('validation')) return WorkflowErrorCode.VALIDATION_ERROR
      if (message.includes('timeout')) return WorkflowErrorCode.EXECUTION_TIMEOUT
      if (message.includes('not found')) return WorkflowErrorCode.NOT_FOUND
      if (message.includes('forbidden')) return WorkflowErrorCode.FORBIDDEN
      if (message.includes('unauthorized')) return WorkflowErrorCode.UNAUTHORIZED
      if (message.includes('node not found'))
        return WorkflowErrorCode.NODE_NOT_FOUND
      if (message.includes('circular')) return WorkflowErrorCode.CIRCULAR_DEPENDENCY
      if (message.includes('duplicate')) return WorkflowErrorCode.DUPLICATE_NODE_NAME
      if (message.includes('tenant')) return WorkflowErrorCode.TENANT_MISMATCH
      if (message.includes('memory')) return WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
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
    const code = (error.code || '').toUpperCase()
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

    return suggestions[code] || 'Fix this validation issue and retry.'
  }

  /**
   * Get recovery suggestions based on validation errors
   */
  private getRecoverySuggestions(errors: ValidationError[]): string[] {
    const suggestions = new Set<string>()

    for (const error of errors) {
      const suggestion = this.getSuggestionForError(error)
      if (suggestion) {
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
  if (!globalHandler) {
    globalHandler = new WorkflowErrorHandler(isDevelopment)
  }
  return globalHandler
}

/**
 * Reset global error handler (for testing)
 */
export function resetWorkflowErrorHandler(): void {
  globalHandler = null
}
