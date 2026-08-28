/** What each code suggests the caller try next. */

import { WorkflowErrorCode } from './error-codes'

export const ERROR_HINTS: Record<WorkflowErrorCode, string> = {
  [WorkflowErrorCode.VALIDATION_ERROR]:
    'Verify workflow structure, check nodes, connections, and parameters.',
  [WorkflowErrorCode.MISSING_REQUIRED_FIELD]:
    'Ensure all required fields are populated.',
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
  [WorkflowErrorCode.EXECUTION_QUEUE_FULL]:
    'Wait a moment and retry the execution.',
  [WorkflowErrorCode.MISSING_WORKFLOW_DEFINITION]:
    'Provide a valid workflow definition.',
  [WorkflowErrorCode.INVALID_WORKFLOW_FORMAT]:
    'Ensure workflow format is correct.',
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
  [WorkflowErrorCode.NOT_FOUND]:
    'Verify the resource exists and is accessible.',
  [WorkflowErrorCode.WORKFLOW_NOT_FOUND]:
    'Workflow has been deleted or is inaccessible.',
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
