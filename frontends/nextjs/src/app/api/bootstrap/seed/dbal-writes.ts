/** The writes the bootstrap seeder makes against DBAL. */

import { ENTITY_BASE } from './endpoint'



export async function dbalDelete(entity: string, id: string): Promise<void> {
  await fetch(`${ENTITY_BASE}/${entity}/${id}`, { method: 'DELETE' }).catch(
    () => null
  )
}

/**
 * Write a page's tree as rows: one PageTree, one PageTreeNode per node, one
 * PageTreeProp per property. Deleting the PageTree first cascades its nodes
 * and properties away, so re-seeding replaces a tree rather than merging
 * into it. Returns the tree id to hang off PageConfig.pageTreeId.
 */
export async function seedPageTree(
  pageId: string,
  title: string,
  root: Record<string, unknown>
): Promise<string | null> {
  const treeId = `tree_${pageId}`
  await dbalDelete('PageTree', treeId)

  const stamp = Date.now()
  const created = await dbalPost('PageTree', {
    id: treeId,
    tenantId: 'system',
    name: title,
    description: `Seeded for ${pageId}`,
    createdAt: stamp,
    updatedAt: stamp,
  })
  if (!created.ok) return null

  let counter = 0
  const writeNode = async (
    node: Record<string, unknown>,
    parentId: string | null,
    order: number
  ): Promise<boolean> => {
    counter += 1
    const rawId = node.id
    const nodeId = `${treeId}__${typeof rawId === 'string' && rawId.length > 0 ? rawId : `n${counter}`}`
    const nodeRes = await dbalPost('PageTreeNode', {
      id: nodeId,
      tenantId: 'system',
      treeId,
      parentId,
      type: typeof node.type === 'string' ? node.type : 'container',
      sortOrder: order,
    })
    if (!nodeRes.ok) return false

    const props = (node.props ?? {}) as Record<string, unknown>
    for (const [propOrder, [name, raw]] of Object.entries(props).entries()) {
      const valueType =
        typeof raw === 'boolean'
          ? 'boolean'
          : typeof raw === 'number'
            ? 'number'
            : 'string'
      const value =
        typeof raw === 'string' ? raw : raw == null ? '' : JSON.stringify(raw)
      const propRes = await dbalPost('PageTreeProp', {
        id: `${nodeId}__${name}`,
        tenantId: 'system',
        nodeId,
        treeId,
        name,
        value,
        valueType,
        // See write-node.ts: the schema requires this on every prop row.
        sortOrder: propOrder,
      })
      if (!propRes.ok) return false
    }

    const kids = (node.children ?? []) as Record<string, unknown>[]
    for (const [index, child] of kids.entries()) {
      if (!(await writeNode(child, nodeId, index))) return false
    }
    return true
  }

  return (await writeNode(root, null, 0)) ? treeId : null
}

export async function dbalPost(
  entity: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { ok: res.ok, status: res.status }
}

export async function dbalUpsert(
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; status: number }> {
  const post = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (post.ok || post.status !== 409) {
    return { ok: post.ok, status: post.status }
  }

  const put = await fetch(
    `${ENTITY_BASE}/${entity}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
  return { ok: put.ok, status: put.status }
}
