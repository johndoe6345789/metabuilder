import { propValueType } from './prop-value'
import type { TreeNodeShape } from './types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** Writes one node's row, its prop rows, then recurses into its
 *  children in order -- returns false on the first failed write. */
export async function writeNode(
  base: string,
  tenant: string,
  treeId: string,
  node: TreeNodeShape,
  parentId: string | null,
  order: number,
  nodeCounter: { value: number }
): Promise<boolean> {
  nodeCounter.value += 1
  const nodeId = `${treeId}__${node.id.length > 0 ? node.id : `n${nodeCounter.value}`}`
  const nodeRes = await fetch(`${base}/PageTreeNode`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      id: nodeId,
      tenantId: tenant,
      treeId,
      parentId,
      type: node.type,
      sortOrder: order,
    }),
  })
  if (!nodeRes.ok) return false

  for (const [name, raw] of Object.entries(node.props)) {
    const { valueType, value } = propValueType(raw)
    const propRes = await fetch(`${base}/PageTreeProp`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        id: `${nodeId}__${name}`,
        tenantId: tenant,
        nodeId,
        treeId,
        name,
        value,
        valueType,
      }),
    })
    if (!propRes.ok) return false
  }

  for (const [index, child] of node.children.entries()) {
    const ok = await writeNode(
      base,
      tenant,
      treeId,
      child,
      nodeId,
      index,
      nodeCounter
    )
    if (!ok) return false
  }
  return true
}
