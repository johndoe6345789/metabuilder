/**
 * DBAL namespace operations
 */

import type { Namespace } from './types'
export {
  dbalGetSnippetComments,
  dbalCreateSnippetComment,
  dbalGetProfileComments,
  dbalCreateProfileComment,
} from './storage-dbal-comments'

const DBAL_TENANT = 'pastebin'

export function toNamespace(raw: Record<string, unknown>): Namespace {
  return {
    id: raw.id as string,
    name: raw.name as string,
    createdAt: Number(raw.createdAt) || 0,
    isDefault: !!raw.isDefault,
    userId: raw.userId as string | undefined,
    tenantId: raw.tenantId as string | undefined,
  }
}

export async function dbalGetAllNamespaces(
  entityUrl: string,
  userId: string,
  authHeader: Record<string, string>,
): Promise<Namespace[]> {
  const url =
    `${entityUrl}/Namespace` +
    `?filter.userId=${userId}&sort.isDefault=desc` +
    `&sort.name=asc&limit=500`
  const r = await fetch(url, { headers: authHeader })
  if (!r.ok) throw new Error(`Failed to fetch namespaces: ${r.statusText}`)
  const json = await r.json()
  const items: Record<string, unknown>[] = json.data?.data ?? json.data ?? []
  return items.map(i => toNamespace(i))
}

export async function dbalCreateNamespace(
  entityUrl: string,
  namespace: Namespace,
  userId: string,
  authHeader: Record<string, string>,
): Promise<Namespace> {
  const body = {
    name: namespace.name,
    isDefault: namespace.isDefault,
    userId,
    tenantId: DBAL_TENANT,
    createdAt: namespace.createdAt || Date.now(),
  }
  const r = await fetch(`${entityUrl}/Namespace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`Failed to create namespace: ${r.statusText}`)
  const json = await r.json()
  return toNamespace(json.data ?? json)
}

export async function dbalUpdateNamespace(
  entityUrl: string,
  id: string,
  name: string,
  authHeader: Record<string, string>,
): Promise<Namespace> {
  const r = await fetch(`${entityUrl}/Namespace/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`Failed to update namespace: ${r.statusText}`)
  const json = await r.json()
  return toNamespace(json.data ?? json)
}

export async function dbalDeleteNamespace(
  entityUrl: string,
  id: string,
  authHeader: Record<string, string>,
): Promise<void> {
  const r = await fetch(`${entityUrl}/Namespace/${id}`, {
    method: 'DELETE',
    headers: authHeader,
  })
  if (!r.ok) throw new Error(`Failed to delete namespace: ${r.statusText}`)
}
