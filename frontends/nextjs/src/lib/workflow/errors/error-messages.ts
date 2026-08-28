/** What each code says to the caller. */

import { WorkflowErrorCode } from './error-codes'

export const ERROR_MESSAGES: Record<WorkflowErrorCode, string> = {
  // Validation
  [WorkflowErrorCode.VALIDATION_ERROR]: 'Workflow validation failed',
  [WorkflowErrorCode.MISSING_REQUIRED_FIELD]:
    'Missing required field in workflow definition',
  [WorkflowErrorCode.INVALID_NODE_TYPE]: 'Invalid node type specified',
  [WorkflowErrorCode.INVALID_CONNECTION]: 'Invalid connection between nodes',
  [WorkflowErrorCode.INVALID_WORKFLOW_STRUCTURE]:
    'Workflow structure is invalid',
  [WorkflowErrorCode.DUPLICATE_NODE_NAME]: 'Duplicate node name detected',
  [WorkflowErrorCode.CIRCULAR_DEPENDENCY]:
    'Circular dependency detected in workflow',
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
  [WorkflowErrorCode.WORKFLOW_EXECUTION_ABORTED]:
    'Workflow execution was aborted',
  [WorkflowErrorCode.INSUFFICIENT_RESOURCES]:
    'Insufficient resources to execute workflow',
  [WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED]:
    'Memory limit exceeded during execution',
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]:
    'Execution queue is full, please try again later',

  // Data/Configuration
  [WorkflowErrorCode.MISSING_WORKFLOW_DEFINITION]:
    'Workflow definition is required',
  [WorkflowErrorCode.INVALID_WORKFLOW_FORMAT]: 'Workflow format is invalid',
  [WorkflowErrorCode.INVALID_CONTEXT]: 'Invalid execution context',
  [WorkflowErrorCode.INVALID_PARAMETER]: 'Invalid parameter value',
  [WorkflowErrorCode.MISSING_VARIABLE]: 'Required variable is missing',
  [WorkflowErrorCode.INVALID_EXPRESSION]: 'Invalid expression syntax',

  // Access control
  [WorkflowErrorCode.FORBIDDEN]: 'Access to workflow is forbidden',
  [WorkflowErrorCode.TENANT_MISMATCH]:
    'Tenant mismatch - cannot access workflow',
  [WorkflowErrorCode.UNAUTHORIZED]: 'Unauthorized - authentication required',
  [WorkflowErrorCode.PERMISSION_DENIED]: 'Permission denied for this action',

  // Not found
  [WorkflowErrorCode.NOT_FOUND]: 'Resource not found',
  [WorkflowErrorCode.WORKFLOW_NOT_FOUND]: 'Workflow not found',
  [WorkflowErrorCode.EXECUTION_NOT_FOUND]: 'Execution not found',
  [WorkflowErrorCode.RESOURCE_NOT_FOUND]: 'Requested resource not found',

  // Rate limiting
  [WorkflowErrorCode.RATE_LIMITED]: 'Too many requests, please try again later',
  [WorkflowErrorCode.CONCURRENT_EXECUTION_LIMIT]:
    'Concurrent execution limit reached',

  // Generic
  [WorkflowErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
  [WorkflowErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
}
