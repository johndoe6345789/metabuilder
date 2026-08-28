/** The HTTP status each code answers with. */

import { WorkflowErrorCode } from './error-codes'

export const ERROR_STATUS_MAP: Record<WorkflowErrorCode, number> = {
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
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]: 429,

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
