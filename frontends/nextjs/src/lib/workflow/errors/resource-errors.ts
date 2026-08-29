/** Which exhaustion an operator actually hit. */

import { WorkflowErrorCode } from './error-codes'

/**
 * Read from the reason text rather than from a parameter, because the
 * callers that raise these are deep in the executor and have a sentence,
 * not a code.
 */
export function exhaustionCode(reason: string): WorkflowErrorCode {
  const text = reason.toLowerCase()
  if (text.includes('memory') && text.includes('limit')) {
    return WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
  }
  if (text.includes('queue')) return WorkflowErrorCode.EXECUTION_QUEUE_FULL
  return WorkflowErrorCode.INSUFFICIENT_RESOURCES
}
