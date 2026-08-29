/** Reading an error code out of an arbitrary thrown value. */

import { WorkflowErrorCode } from './error-codes'

/**
 * Ordered most specific first. `not found` used to be tested before
 * `node not found`, which made NODE_NOT_FOUND unreachable: every missing
 * node came back as a plain NOT_FOUND.
 */
const CODE_BY_PHRASE: ReadonlyArray<[string, WorkflowErrorCode]> = [
  ['node not found', WorkflowErrorCode.NODE_NOT_FOUND],
  ['validation', WorkflowErrorCode.VALIDATION_ERROR],
  ['timeout', WorkflowErrorCode.EXECUTION_TIMEOUT],
  ['not found', WorkflowErrorCode.NOT_FOUND],
  ['forbidden', WorkflowErrorCode.FORBIDDEN],
  ['unauthorized', WorkflowErrorCode.UNAUTHORIZED],
  ['circular', WorkflowErrorCode.CIRCULAR_DEPENDENCY],
  ['duplicate', WorkflowErrorCode.DUPLICATE_NODE_NAME],
  ['tenant', WorkflowErrorCode.TENANT_MISMATCH],
  ['memory', WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED],
]

export function classifyError(error: unknown): WorkflowErrorCode {
  if (!(error instanceof Error)) return WorkflowErrorCode.UNKNOWN_ERROR
  const message = error.message.toLowerCase()
  for (const [phrase, code] of CODE_BY_PHRASE) {
    if (message.includes(phrase)) return code
  }
  return WorkflowErrorCode.UNKNOWN_ERROR
}

/** The message a thrown value carries, whatever it is. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
