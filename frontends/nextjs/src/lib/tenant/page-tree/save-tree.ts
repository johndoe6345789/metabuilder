import { collectRows } from './collect-rows'
import { describeFailure } from './write-failure'
import type { TreeNodeShape } from './types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Write a tree as rows, replacing whatever `treeId` held.
 *
 * Deleting the PageTree first cascades its nodes and their properties away,
 * so a republish replaces a tree instead of merging into it.
 *
 * The rows go in two bulk requests rather than one request per row. A page
 * of a dozen blocks is fifty-odd rows, and DBAL's mutation limiter allows
 * 50 a minute per address -- so publishing a real page failed partway with
 * a 429 and left the tree half written. Bulk create also runs server-side
 * in a transaction, which makes a publish all-or-nothing rather than
 * something that can stop in the middle.
 *
 * Returns null when the whole tree wrote, or the server's reason for
 * refusing.
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
    headers: JSON_HEADERS,
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

  const { nodes, props } = collectRows(tenant, treeId, root)

  const wroteNodes = await bulkCreate(base, 'PageTreeNode', nodes)
  if (wroteNodes !== null) return wroteNodes

  // A tree whose root has no properties is legitimate; bulk create refuses
  // an empty array, so there is simply nothing to send.
  if (props.length === 0) return null
  return await bulkCreate(base, 'PageTreeProp', props)
}

async function bulkCreate(
  base: string,
  entity: string,
  rows: unknown[]
): Promise<string | null> {
  const res = await fetch(`${base}/${entity}/_bulk/create`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(rows),
  })
  return res.ok ? null : await describeFailure(entity, res)
}
