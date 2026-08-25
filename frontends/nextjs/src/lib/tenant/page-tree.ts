/**
 * Read and write a page tree as rows.
 *
 * A tree is PageTree (identity) + PageTreeNode (shape, via parentId and
 * sortOrder) + PageTreeProp (one row per property). Two requests reassemble
 * one: all nodes for the tree, all props for the tree. Both carry treeId
 * precisely so neither needs a join the data layer cannot do.
 */

export interface TreeNodeShape {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNodeShape[]
}

interface NodeRow {
  id: string
  parentId: string | null
  type: string
  sortOrder: number
}

interface PropRow {
  nodeId: string
  name: string
  value: string | null
  valueType: string
}

function rowsOf(payload: unknown): Record<string, unknown>[] {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

function readProp(row: PropRow): unknown {
  const raw = row.value ?? ''
  if (row.valueType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (row.valueType === 'boolean') return raw === 'true'
  return raw
}

/** Which type a prop value should be stored as. */
export function propValueType(value: unknown): {
  valueType: 'string' | 'number' | 'boolean'
  value: string
} {
  if (typeof value === 'boolean') {
    return { valueType: 'boolean', value: value ? 'true' : 'false' }
  }
  if (typeof value === 'number') {
    return { valueType: 'number', value: String(value) }
  }
  if (typeof value === 'string') return { valueType: 'string', value }
  // Anything else (object, array, null) has no relational representation --
  // store it empty rather than the string "[object Object]".
  return { valueType: 'string', value: value == null ? '' : JSON.stringify(value) }
}

/** Rebuild the tree for `treeId`, or null if it has no root. */
export async function loadTree(
  dbal: string,
  tenant: string,
  treeId: string,
  signal?: AbortSignal
): Promise<TreeNodeShape | null> {
  const base = `${dbal}/${tenant}/core`
  const q = `?filter.treeId=${encodeURIComponent(treeId)}&limit=2000`

  const [nodeRes, propRes] = await Promise.all([
    fetch(`${base}/PageTreeNode${q}`, { signal, cache: 'no-store' }),
    fetch(`${base}/PageTreeProp${q}`, { signal, cache: 'no-store' }),
  ])
  if (!nodeRes.ok || !propRes.ok) return null

  const nodes = rowsOf(await nodeRes.json()) as unknown as NodeRow[]
  const props = rowsOf(await propRes.json()) as unknown as PropRow[]
  if (nodes.length === 0) return null

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
    if (n.parentId === null || n.parentId === undefined) {
      root ??= node
      continue
    }
    built.get(n.parentId)?.children.push(node)
  }
  return root
}

/**
 * Write a tree as rows, replacing whatever `treeId` held.
 *
 * Deleting the PageTree first cascades its nodes and their properties away,
 * so a republish replaces a tree instead of merging into it.
 */
export async function saveTree(
  dbal: string,
  tenant: string,
  treeId: string,
  name: string,
  root: TreeNodeShape,
  description = ''
): Promise<boolean> {
  const base = `${dbal}/${tenant}/core`
  const json = { 'Content-Type': 'application/json' }

  await fetch(`${base}/PageTree/${treeId}`, { method: 'DELETE' }).catch(
    () => null
  )

  const stamp = Date.now()
  const tree = await fetch(`${base}/PageTree`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({
      id: treeId,
      tenantId: tenant,
      name,
      description,
      createdAt: stamp,
      updatedAt: stamp,
    }),
  })
  if (!tree.ok) return false

  let counter = 0
  const write = async (
    node: TreeNodeShape,
    parentId: string | null,
    order: number
  ): Promise<boolean> => {
    counter += 1
    const nodeId = `${treeId}__${node.id || `n${counter}`}`
    const nodeRes = await fetch(`${base}/PageTreeNode`, {
      method: 'POST',
      headers: json,
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

    for (const [name_, raw] of Object.entries(node.props ?? {})) {
      const { valueType, value } = propValueType(raw)
      const propRes = await fetch(`${base}/PageTreeProp`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({
          id: `${nodeId}__${name_}`,
          tenantId: tenant,
          nodeId,
          treeId,
          name: name_,
          value,
          valueType,
        }),
      })
      if (!propRes.ok) return false
    }

    for (const [index, child] of (node.children ?? []).entries()) {
      if (!(await write(child, nodeId, index))) return false
    }
    return true
  }

  return write(root, null, 0)
}
