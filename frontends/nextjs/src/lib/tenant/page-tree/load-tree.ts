import { rowsOf } from './rows-of'
import { assembleTree } from './assemble-tree'
import type { NodeRow, PropRow, TreeNodeShape } from './types'

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

  return assembleTree(nodes, props)
}
