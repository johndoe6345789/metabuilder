/**
 * @file workflow-validation.ts
 * @description Workflow validation functions
 */

const VALID_WORKFLOW_TYPES = ['manual', 'schedule', 'event', 'webhook'] as const

export const validateWorkflowType = (type: string): boolean => {
  return VALID_WORKFLOW_TYPES.includes(type as (typeof VALID_WORKFLOW_TYPES)[number])
}
