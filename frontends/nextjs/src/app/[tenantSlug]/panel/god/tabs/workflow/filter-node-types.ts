import { NODE_TYPES, type NodeType } from '@/workflow-editor'

/** The palette search box's match: name or description contains the
 *  (lowercased) query. An empty query returns the full catalogue. */
export function filterNodeTypes(query: string): NodeType[] {
  const q = query.toLowerCase()
  if (q === '') return NODE_TYPES
  return NODE_TYPES.filter(
    n =>
      n.name.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
  )
}
