import { prisma } from '../prisma'
import type { Workflow } from '../../level-types'

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  const workflows = await prisma.workflow.findMany()
  return workflows.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description || undefined,
    nodes: JSON.parse(w.nodes),
    edges: JSON.parse(w.edges),
    enabled: w.enabled,
  }))
}
