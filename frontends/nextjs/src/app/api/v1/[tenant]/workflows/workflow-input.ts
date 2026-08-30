/** Turning a POST body into a workflow row, or refusing it. */

import { asString } from '@/lib/api/as-string'

export const VALID_CATEGORIES = [
  'automation',
  'integration',
  'business-logic',
  'data-transformation',
  'notification',
  'approval',
  'other',
] as const

export function validateWorkflowInput(body: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (body.name == null || typeof body.name !== 'string') {
    errors.push('name is required and must be a string')
  }
  const category = body.category
  const isValidCategory =
    typeof category === 'string' &&
    (VALID_CATEGORIES as readonly string[]).includes(category)
  if (!isValidCategory) {
    errors.push(
      'category must be one of: automation, integration, business-logic, etc'
    )
  }
  return errors
}

export interface WorkflowInputContext {
  tenant: string
  createdBy: string
  id: string
  now: Date
}

/**
 * The full row written to the data layer.
 *
 * tenantId, createdBy and id come from the route's own context, never
 * from the body -- a caller cannot create a workflow it did not ask for
 * inside a tenant it does not own by naming one in the payload.
 */
export function buildWorkflowRecord(
  body: Record<string, unknown>,
  context: WorkflowInputContext
): Record<string, unknown> {
  return {
    id: context.id,
    tenantId: context.tenant,
    name: asString(body.name),
    description: typeof body.description === 'string' ? body.description : '',
    version: '1.0.0',
    createdBy: context.createdBy,
    createdAt: context.now,
    updatedAt: context.now,
    active: body.active !== false,
    locked: false,
    tags: Array.isArray(body.tags) ? body.tags : [],
    category: asString(body.category),
    nodes: Array.isArray(body.nodes) ? body.nodes : [],
    connections: body.connections ?? {},
    triggers: Array.isArray(body.triggers) ? body.triggers : [],
    variables: body.variables ?? {},
  }
}
