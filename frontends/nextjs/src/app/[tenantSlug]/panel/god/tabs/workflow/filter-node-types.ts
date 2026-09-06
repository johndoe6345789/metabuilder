import type { NodeType } from '@/workflow-editor'
import { RUNNABLE_STEPS } from './runnable-steps'

/** The palette search box's match: name or description contains the
 *  (lowercased) query. An empty query returns the full catalogue. */
export function filterNodeTypes(query: string): NodeType[] {
  const q = query.toLowerCase()
  if (q === '') return RUNNABLE_STEPS
  return RUNNABLE_STEPS.filter(
    n =>
      n.name.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      // The step type itself, so someone who knows DBAL can search for
      // `dbal.entity.create` and find "Save a row".
      n.id.toLowerCase().includes(q)
  )
}
