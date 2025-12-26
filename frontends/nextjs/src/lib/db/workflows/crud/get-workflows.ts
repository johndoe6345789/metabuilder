import { getAdapter } from '../dbal-client'
import type { Workflow } from '../../types/level-types'

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  const adapter = getAdapter()
  const result = await adapter.list('Workflow')
  return (result.data as any[]).map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description || undefined,
    nodes: JSON.parse(w.nodes),
    edges: JSON.parse(w.edges),
    enabled: w.enabled,
  }))
}
