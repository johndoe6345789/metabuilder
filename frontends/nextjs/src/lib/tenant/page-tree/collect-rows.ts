import { propValueType } from './prop-value'
import type { TreeNodeShape } from './types'

export interface NodeRowToWrite {
  id: string
  tenantId: string
  treeId: string
  parentId: string | null
  type: string
  sortOrder: number
}

export interface PropRowToWrite {
  id: string
  tenantId: string
  nodeId: string
  treeId: string
  name: string
  value: string
  valueType: string
  sortOrder: number
}

/**
 * Flatten a tree into the rows that represent it.
 *
 * Separated from writing them so the shape of a saved tree can be checked
 * without a server, and so saving can send the rows in bulk: a page of a
 * dozen blocks is fifty-odd rows, and one request each ran into DBAL's
 * mutation rate limit (50/min) long before the page was large.
 */
export function collectRows(
  tenant: string,
  treeId: string,
  root: TreeNodeShape
): { nodes: NodeRowToWrite[]; props: PropRowToWrite[] } {
  const nodes: NodeRowToWrite[] = []
  const props: PropRowToWrite[] = []
  const counter = { value: 0 }

  const walk = (
    node: TreeNodeShape,
    parentId: string | null,
    order: number
  ): void => {
    counter.value += 1
    // Checked rather than trusted: the fallback below was written for an
    // *empty* id, and a tree that reached here through a cast had none at
    // all, so `node.id.length` threw a TypeError on the first child and
    // took the whole publish with it. The declared type says this is
    // always a string; that is exactly the claim a cast can break.
    const declared = typeof node.id === 'string' ? node.id : ''
    const own = declared.length > 0 ? declared : `n${counter.value}`
    const nodeId = `${treeId}__${own}`

    nodes.push({
      id: nodeId,
      tenantId: tenant,
      treeId,
      parentId,
      type: node.type,
      sortOrder: order,
    })

    for (const [propOrder, [name, raw]] of Object.entries(
      node.props
    ).entries()) {
      const { valueType, value } = propValueType(raw)
      props.push({
        id: `${nodeId}__${name}`,
        tenantId: tenant,
        nodeId,
        treeId,
        name,
        value,
        valueType,
        // Required by the schema; props reassemble by name, so the value
        // only has to be present and stable.
        sortOrder: propOrder,
      })
    }

    for (const [index, child] of node.children.entries()) {
      walk(child, nodeId, index)
    }
  }

  walk(root, null, 0)
  return { nodes, props }
}
