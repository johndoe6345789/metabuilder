/**
 * @file workflow-validation.ts
 * @description Workflow validation functions
 */

const VALID_WORKFLOW_TYPES = ['manual', 'automated', 'scheduled', 'triggered'];

/**
 * Validate workflow type
 */
export function validateWorkflowType(type: string): boolean {
  return VALID_WORKFLOW_TYPES.includes(type);
}
