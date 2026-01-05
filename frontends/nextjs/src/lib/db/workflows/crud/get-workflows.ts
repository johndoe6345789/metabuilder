import { getAdapter } from '../../core/dbal-client'
import type { Workflow } from '@/lib/types/level-types'

type DBALWorkflowRecord = {
  id: string
  name: string
  description?: string | null
  nodes: string
  edges: string
  enabled: boolean
}

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('Workflow')) as { data: DBALWorkflowRecord[] }
  return result.data.map(w => ({
    id: w.id,
    name: w.name,
    description: w.description || undefined,
    nodes: JSON.parse(w.nodes),
    edges: JSON.parse(w.edges),
    enabled: w.enabled,
  }))
}
