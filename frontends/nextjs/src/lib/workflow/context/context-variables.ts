/**
 * The variables a run starts with.
 *
 * Two rules matter here and both are security rules: a global-scope
 * variable is never carried into a run, and a variable the workflow does
 * not declare is never accepted from the request.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type { DataRecord, RequestContext } from './context-types'

/** Read-only context injected into every run under reserved names. */
export const RESERVED_VARIABLES = ['_tenantId', '_userId', '_userLevel']

export function buildVariables(
  workflow: Pick<WorkflowDefinition, 'variables'>,
  request: Pick<RequestContext, 'tenantId' | 'userId' | 'userLevel'>,
  requestVariables?: DataRecord
): DataRecord {
  const variables: DataRecord = {}

  for (const [name, definition] of Object.entries(workflow.variables)) {
    if (definition.scope === 'global') {
      console.warn(
        `[SECURITY] Skipping global-scope variable ${name} - not allowed`
      )
      continue
    }
    variables[name] = definition.defaultValue ?? null
  }

  for (const [name, value] of Object.entries(requestVariables ?? {})) {
    // `name` is a key from the request, not from workflow.variables --
    // this is the "not in workflow definition" security check the file
    // header describes, not a type-narrowing formality.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (workflow.variables[name] != null) {
      variables[name] = value
      continue
    }
    console.warn(
      `[SECURITY] Rejecting unknown variable ${name} - not in workflow definition`
    )
  }

  variables._tenantId = request.tenantId
  variables._userId = request.userId
  variables._userLevel = request.userLevel
  return variables
}

/**
 * Blanks any variable carrying another tenant's id.
 *
 * A single tainted variable drops out rather than failing the whole run:
 * the value is gone either way, and a run that starts is one an operator
 * can see the result of.
 */
export function stripCrossTenantVariables(
  variables: DataRecord,
  tenantId: string
): DataRecord {
  for (const [name, value] of Object.entries(variables)) {
    if (value === null || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    if (record._tenantId != null && record._tenantId !== tenantId) {
      variables[name] = null
    }
  }
  return variables
}
