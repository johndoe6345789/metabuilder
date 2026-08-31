import { writeNode } from './write-node'
import type { TreeNodeShape } from './types'

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

  await fetch(`${base}/PageTree/${treeId}`, { method: 'DELETE' }).catch(
    () => null
  )

  const stamp = Date.now()
  const tree = await fetch(`${base}/PageTree`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  return writeNode(base, tenant, treeId, root, null, 0, { value: 0 })
}
