import { readProp } from './prop-value'
import type { NodeRow, PropRow, TreeNodeShape } from './types'

/** Reassembles the flat node/prop rows into the nested tree shape,
 *  ordering siblings by sortOrder. Returns null if no row is parentless
 *  (there's no root to hang the rest off of). */
export function assembleTree(
  nodes: NodeRow[],
  props: PropRow[]
): TreeNodeShape | null {
  const propsByNode = new Map<string, Record<string, unknown>>()
  for (const p of props) {
    const bag = propsByNode.get(p.nodeId) ?? {}
    bag[p.name] = readProp(p)
    propsByNode.set(p.nodeId, bag)
  }

  const built = new Map<string, TreeNodeShape>()
  for (const n of nodes) {
    built.set(n.id, {
      id: n.id,
      type: n.type,
      props: propsByNode.get(n.id) ?? {},
      children: [],
    })
  }

  let root: TreeNodeShape | null = null
  const ordered = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder)
  for (const n of ordered) {
    const node = built.get(n.id)
    if (node === undefined) continue
    if (n.parentId === null) {
      root ??= node
      continue
    }
    built.get(n.parentId)?.children.push(node)
  }
  return root
}
