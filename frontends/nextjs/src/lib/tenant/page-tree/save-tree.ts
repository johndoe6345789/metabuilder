import { collectRows } from './collect-rows'
import { describeFailure } from './write-failure'
import type { TreeNodeShape } from './types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Write a tree as rows, under an id nothing is using yet.
 *
 * It used to DELETE `treeId` first and build the replacement afterwards,
 * discarding the delete's result -- so anything that failed after that
 * point (a 422, a 429 from the mutation limiter, a dropped connection)
 * left the founder with "Publish failed" and a site that was already down,
 * with nothing to roll back to. Writing beside the live tree and moving
 * PageConfig.pageTreeId afterwards makes the swap atomic for readers: that
 * single pointer is the only way a visitor reaches a tree.
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


/**
 * Remove a tree and everything hanging off it.
 *
 * The children go first and by name. `page_tree_node.json` declares
 * `on_delete: cascade`, but only the Prisma generator reads that field --
 * the SQL templates the live adapters run emit no FOREIGN KEY at all, so
 * deleting the PageTree alone leaves its nodes and props behind forever.
 *
 * Best-effort on purpose, and deliberately unchecked: this runs *after*
 * the new tree is live, so the worst outcome is rows nothing points at --
 * loadTree selects on treeId, so orphans are invisible, not corrupting.
 * That also covers the case where the data layer does not accept a
 * filtered collection DELETE at all.
 */
export async function deleteTree(
  dbal: string,
  tenant: string,
  treeId: string
): Promise<void> {
  const base = `${dbal}/${tenant}/core`
  for (const entity of ['PageTreeProp', 'PageTreeNode']) {
    const query = new URLSearchParams({ 'filter.treeId': treeId })
    await fetch(`${base}/${entity}?${query.toString()}`, {
      method: 'DELETE',
    }).catch(() => null)
  }
  await fetch(`${base}/PageTree/${treeId}`, { method: 'DELETE' }).catch(
    () => null
  )
}
