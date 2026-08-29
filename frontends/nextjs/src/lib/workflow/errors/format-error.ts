/**
 * One builder for every error answer.
 *
 * Nine handlers each assembled the same object by hand, which is how the
 * `hint` came to be attached in eight slightly different places.
 */

import type { WorkflowErrorCode } from './error-codes'
import { ERROR_HINTS } from './error-hints'
import { ERROR_MESSAGES } from './error-messages'
import { ERROR_STATUS_MAP } from './error-status'
import type {
  ErrorContext,
  ErrorDiagnostics,
  FormattedError,
  WorkflowApiResponse,
} from './error-types'

export interface FormatOptions {
  code: WorkflowErrorCode
  /** Overrides the catalogue message; the catalogue is used when absent. */
  message?: string
  /** Overrides the catalogue status. */
  status?: number
  details?: Record<string, unknown>
  context?: ErrorContext
  /** Merged over the hint the catalogue supplies for this code. */
  diagnostics?: ErrorDiagnostics
  headers?: Map<string, string>
}

/** Only the linking fields, so a context object cannot leak into a body. */
function linkedContext(context?: ErrorContext): FormattedError['context'] {
  if (context === undefined) return undefined
  return {
    executionId: context.executionId,
    workflowId: context.workflowId,
    nodeId: context.nodeId,
    tenantId: context.tenantId,
  }
}

export function formatError(options: FormatOptions): WorkflowApiResponse {
  const status = options.status ?? ERROR_STATUS_MAP[options.code]
  const json: FormattedError = {
    success: false,
    error: {
      code: options.code,
      message: options.message ?? ERROR_MESSAGES[options.code],
      statusCode: status,
      details: options.details,
    },
    context: linkedContext(options.context),
    diagnostics: {
      hint: ERROR_HINTS[options.code],
      ...options.diagnostics,
    },
  }
  return options.headers === undefined
    ? { status, json }
    : { status, json, headers: options.headers }
}
