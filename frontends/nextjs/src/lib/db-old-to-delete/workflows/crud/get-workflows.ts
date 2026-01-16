import { getAdapter } from '../../core/dbal-client'
import type { Workflow } from '@/lib/types/level-types'

type DBALWorkflowRecord = {
  id: string
  name: string
  description?: string | null
  nodes: string
  edges: string
  enabled: boolean
  tenantId?: string | null
}

export interface GetWorkflowsOptions {
  /** Filter by tenant ID for multi-tenancy */
  tenantId?: string
}

/**
 * Get all workflows, optionally filtered by tenant
 */
export async function getWorkflows(options?: GetWorkflowsOptions): Promise<Workflow[]> {
  const adapter = getAdapter()
  const listOptions = options?.tenantId !== undefined
    ? { filter: { tenantId: options.tenantId } }
    : undefined
  const result = listOptions !== undefined
    ? (await adapter.list('Workflow', listOptions)) as { data: DBALWorkflowRecord[] }
    : (await adapter.list('Workflow')) as { data: DBALWorkflowRecord[] }
  return result.data.map(w => ({
    id: w.id,
    name: w.name,
    description: w.description !== null && w.description !== undefined && w.description !== '' ? w.description : undefined,
    nodes: JSON.parse(w.nodes) as Workflow['nodes'],
    edges: JSON.parse(w.edges) as Workflow['edges'],
    enabled: w.enabled,
  }))
}
