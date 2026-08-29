/** Everything that makes a request unable to build a context. */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type {
  ContextBuilderOptions,
  ContextValidationError,
  RequestContext,
} from './context-types'
import { isValidUserLevel } from './context-safety'
import { checkTenantAccess } from './tenant-access'

export function requiredField(
  value: string,
  path: string,
  message: string
): ContextValidationError | null {
  if (value.trim() !== '') return null
  return { path, message, code: 'MISSING_REQUIRED_FIELD' }
}

export function collectErrors(
  workflow: WorkflowDefinition,
  request: RequestContext,
  options: ContextBuilderOptions
): ContextValidationError[] {
  const errors: ContextValidationError[] = []
  const access = checkTenantAccess(workflow, request, options)
  if (!access.allowed) {
    errors.push({
      path: 'multiTenant.tenantId',
      message: access.reason,
      code: 'TENANT_MISMATCH',
    })
  }

  if (!isValidUserLevel(request.userLevel)) {
    errors.push({
      path: 'user.level',
      message: `Invalid user level: ${String(request.userLevel)}`,
      code: 'UNAUTHORIZED_ACCESS',
    })
  }

  const missing = [
    requiredField(request.userId, 'user.id', 'User ID is required'),
    requiredField(
      workflow.tenantId,
      'workflow.tenantId',
      'Workflow must have a tenantId'
    ),
  ]
  for (const error of missing) {
    if (error !== null) errors.push(error)
  }
  return errors
}

