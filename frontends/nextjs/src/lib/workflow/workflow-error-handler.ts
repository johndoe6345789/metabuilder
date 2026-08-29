/**
 * Workflow Error Handler — production-ready error response formatter.
 *
 * Structured codes with HTTP status mapping, user-facing messages with
 * recovery suggestions, diagnostics, context linking, and stack traces in
 * development only.
 *
 * The codes and the three tables keyed by them live in ./errors, where a
 * test checks they stay in step; so does the single builder every handler
 * below delegates to. This file is the catalogue of situations.
 */

import type { ValidationError } from '@metabuilder/workflow'
import { classifyError, errorMessage } from './errors/classify-error'
import { WorkflowErrorCode } from './errors/error-codes'
import { ERROR_HINTS } from './errors/error-hints'
import { formatError } from './errors/format-error'
import { exhaustionCode } from './errors/resource-errors'
import { recoverySuggestions, suggestionFor } from './errors/suggestions'
import type {
  ErrorContext,
  WorkflowApiResponse,
} from './errors/error-types'

export { WorkflowErrorCode }
export * from './errors/error-types'

const MAX_REPORTED_ERRORS = 10
const MAX_REPORTED_WARNINGS = 5

/**
 * Formats workflow failures for the API, with tenant-safe context and a
 * clear split between what a developer sees and what a caller sees.
 */
export class WorkflowErrorHandler {
  private readonly isDevelopment: boolean

  constructor(isDevelopment: boolean = process.env.NODE_ENV !== 'production') {
    this.isDevelopment = isDevelopment
  }

  /** Validation failures, with per-error advice. */
  handleValidationError(
    errors: ValidationError[],
    warnings: ValidationError[] = [],
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    return formatError({
      code: WorkflowErrorCode.VALIDATION_ERROR,
      message:
        `Workflow validation failed: ${errors.length} error(s), ` +
        `${warnings.length} warning(s)`,
      status: 400,
      details: {
        errorCount: errors.length,
        warningCount: warnings.length,
        action: context.action,
      },
      context,
      diagnostics: {
        errors: errors.slice(0, MAX_REPORTED_ERRORS).map(e => ({
          ...e,
          suggestion: suggestionFor(e),
        })),
        warnings: warnings.slice(0, MAX_REPORTED_WARNINGS),
        suggestions: recoverySuggestions(errors),
      },
    })
  }

  /**
   * A failure during a run. The real message is shown in development
   * only; in production the caller gets the catalogue's wording, so an
   * internal message never reaches an API consumer.
   */
  handleExecutionError(
    error: unknown,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    const code = classifyError(error)
    const showCause = this.isDevelopment && context.cause != null
    return formatError({
      code,
      message: this.isDevelopment ? errorMessage(error) : undefined,
      details: { action: context.action, reason: context.reason },
      context,
      diagnostics: showCause
        ? {
            stack: context.cause?.stack,
            context: {
              timestamp: context.timestamp?.toISOString(),
              userId: context.userId,
            },
          }
        : undefined,
    })
  }

  /** A caller reaching for another tenant's workflow. */
  handleAccessError(context: ErrorContext): WorkflowApiResponse {
    return formatError({
      code: WorkflowErrorCode.TENANT_MISMATCH,
      status: 403,
      details: { reason: context.reason ?? 'Tenant ID mismatch' },
      context,
    })
  }

  handleAuthError(
    errorCode: WorkflowErrorCode,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    return formatError({
      code: errorCode,
      details: { action: context.action },
    })
  }

  handleNotFoundError(
    resource: string,
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    return formatError({
      code: WorkflowErrorCode.NOT_FOUND,
      message: `${resource} not found`,
      status: 404,
      details: { ...context },
    })
  }

  handleRateLimitError(retryAfter = 60): WorkflowApiResponse {
    return formatError({
      code: WorkflowErrorCode.RATE_LIMITED,
      status: 429,
      details: { retryAfter },
      headers: new Map([['Retry-After', String(retryAfter)]]),
    })
  }

  handleResourceExhaustedError(
    reason = 'Insufficient resources',
    context: ErrorContext = {}
  ): WorkflowApiResponse {
    return formatError({
      code: exhaustionCode(reason),
      details: { reason },
      context,
    })
  }

  handleTimeoutError(context: ErrorContext = {}): WorkflowApiResponse {
    return formatError({
      code: WorkflowErrorCode.EXECUTION_TIMEOUT,
      status: 504,
      details: {
        executionId: context.executionId,
        nodeId: context.nodeId,
      },
      context,
    })
  }
}

export { ERROR_HINTS }

let globalHandler: WorkflowErrorHandler | null = null

export function getWorkflowErrorHandler(
  isDevelopment?: boolean
): WorkflowErrorHandler {
  globalHandler ??= new WorkflowErrorHandler(isDevelopment)
  return globalHandler
}

/** Reset the shared handler (for testing). */
export function resetWorkflowErrorHandler(): void {
  globalHandler = null
}
