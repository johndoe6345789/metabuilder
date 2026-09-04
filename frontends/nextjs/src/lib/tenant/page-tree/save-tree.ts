import { writeNode } from './write-node'
import { describeFailure } from './write-failure'
import type { TreeNodeShape } from './types'

/**
 * Write a tree as rows, replacing whatever `treeId` held.
 *
 * Deleting the PageTree first cascades its nodes and their properties away,
 * so a republish replaces a tree instead of merging into it.
 *
 * Returns null when the whole tree wrote, or the server's reason for
 * refusing -- a caller that only needs a boolean can check for null, but the
 * reason is what makes a failed publish diagnosable.
 */
export async function saveTree(
  dbal: string,
  tenant: string,
  treeId: string,
  name: string,
  root: TreeNodeShape,
  description = ''
): Promise<string | null> {
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
  if (!tree.ok) return await describeFailure('PageTree', tree)

  return await writeNode(base, tenant, treeId, root, null, 0, { value: 0 })
}
