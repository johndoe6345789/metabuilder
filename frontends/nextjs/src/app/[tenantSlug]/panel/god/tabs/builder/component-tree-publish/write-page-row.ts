import { DBAL } from './find-row-for-path'
import type { PublishTarget } from './types'

/** Builds the PageConfig payload and picks POST-vs-PUT for the given
 *  owner, so publish() itself stays focused on the surrounding flow. */
export async function writePageRow(
  owner: {
    id: string
    packageId?: string
    level?: number
    requiresAuth?: boolean
  } | null,
  id: string,
  target: PublishTarget,
  treeId: string,
  stamp: number
): Promise<Response> {
  const { tenant, path, title } = target
  // A caller that said nothing keeps what the path already had; only a
  // page nobody has published is public by default. BQL said nothing and
  // got 0/false written over an Admin-only route every time it ran.
  const level = target.level ?? owner?.level ?? 0
  const requiresAuth = target.requiresAuth ?? owner?.requiresAuth ?? false
  const payload = {
    id,
    path,
    title,
    packageId: owner?.packageId ?? 'god_builder',
    component: 'component_tree',
    isPublished: true,
    level,
    requiresAuth,
    sortOrder: 0,
    tenantId: tenant,
    pageTreeId: treeId,
    updatedAt: stamp,
  }

  if (owner === null) {
    return fetch(`${DBAL}/${tenant}/core/PageConfig`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, createdAt: stamp }),
      signal: AbortSignal.timeout(6000),
    })
  }
  return fetch(`${DBAL}/${tenant}/core/PageConfig/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  })
}
