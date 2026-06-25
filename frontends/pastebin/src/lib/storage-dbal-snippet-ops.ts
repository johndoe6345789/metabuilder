/**
 * DBAL snippet HTTP operations
 */

import type { Snippet } from './types'
import { toSnippet, snippetToBody } from './storage-dbal-snippets'

type H = Record<string, string>
const j = (r: Response) => r.json()
const items = (d: Record<string, unknown>) =>
  (d.data as { data?: unknown[] })?.data ??
  (d.data as unknown[]) ??
  ([] as Record<string, unknown>[])

export async function dbalGetAllSnippets(
  eu: string,
  uid: string,
  h: H,
): Promise<Snippet[]> {
  const r = await fetch(
    `${eu}/Snippet?filter.userId=${uid}&sort.updatedAt=desc&limit=500`,
    { headers: h },
  )
  if (!r.ok) throw new Error(`Failed to fetch snippets: ${r.statusText}`)
  return (items(await j(r)) as Record<string, unknown>[]).map(toSnippet)
}

export async function dbalGetSnippet(
  eu: string,
  id: string,
  h: H,
): Promise<Snippet | null> {
  const r = await fetch(`${eu}/Snippet/${id}`, { headers: h })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`Failed to fetch snippet: ${r.statusText}`)
  const d = await j(r)
  return toSnippet(d.data ?? d)
}

export async function dbalCreateSnippet(
  eu: string,
  s: Snippet,
  uid: string,
  h: H,
): Promise<Snippet> {
  const r = await fetch(`${eu}/Snippet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h },
    body: JSON.stringify(snippetToBody(s, uid)),
  })
  if (!r.ok) throw new Error(`Failed to create snippet: ${r.statusText}`)
  const d = await j(r)
  return toSnippet(d.data ?? d)
}

export async function dbalUpdateSnippet(
  eu: string,
  s: Snippet,
  uid: string,
  h: H,
): Promise<void> {
  const r = await fetch(`${eu}/Snippet/${s.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...h },
    body: JSON.stringify(snippetToBody(s, uid)),
  })
  if (!r.ok) throw new Error(`Failed to update snippet: ${r.statusText}`)
}

export async function dbalDeleteSnippet(
  eu: string,
  id: string,
  h: H,
): Promise<void> {
  const r = await fetch(`${eu}/Snippet/${id}`, {
    method: 'DELETE',
    headers: h,
  })
  if (!r.ok) throw new Error(`Failed to delete snippet: ${r.statusText}`)
}

export async function dbalGetSnippetsByNamespace(
  eu: string,
  nsId: string,
  uid: string,
  h: H,
): Promise<Snippet[]> {
  const url =
    `${eu}/Snippet?filter.userId=${uid}&filter.namespaceId=${nsId}` +
    `&sort.updatedAt=desc&limit=500`
  const r = await fetch(url, { headers: h })
  if (!r.ok) throw new Error(`Failed to fetch snippets: ${r.statusText}`)
  return (items(await j(r)) as Record<string, unknown>[]).map(toSnippet)
}

export async function dbalBulkMoveSnippets(
  eu: string,
  ids: string[],
  targetNs: string,
  h: H,
): Promise<void> {
  for (const id of ids) {
    const r = await fetch(`${eu}/Snippet/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...h },
      body: JSON.stringify({ namespaceId: targetNs, updatedAt: Date.now() }),
    })
    if (!r.ok) {
      throw new Error(`Failed to bulk move snippets: ${r.statusText}`)
    }
  }
}
