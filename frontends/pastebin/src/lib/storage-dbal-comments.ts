/**
 * DBAL comment operations
 */

import type { SnippetComment, ProfileComment } from './types'

const DBAL_TENANT = 'pastebin'

export async function dbalGetSnippetComments(
  entityUrl: string,
  snippetId: string,
  authHeader: Record<string, string>,
): Promise<SnippetComment[]> {
  const url =
    `${entityUrl}/SnippetComment` +
    `?filter.snippetId=${encodeURIComponent(snippetId)}` +
    `&sort.createdAt=asc&limit=200`
  const r = await fetch(url, { headers: authHeader })
  if (!r.ok) return []
  const json = await r.json()
  return json.data?.data ?? json.data ?? []
}

export async function dbalCreateSnippetComment(
  entityUrl: string,
  comment: SnippetComment,
  authHeader: Record<string, string>,
): Promise<SnippetComment> {
  const r = await fetch(`${entityUrl}/SnippetComment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ ...comment, tenantId: DBAL_TENANT }),
  })
  if (!r.ok) throw new Error(`Failed to create comment: ${r.statusText}`)
  const json = await r.json()
  return json.data ?? json
}

export async function dbalGetProfileComments(
  entityUrl: string,
  profileUserId: string,
  authHeader: Record<string, string>,
): Promise<ProfileComment[]> {
  const url =
    `${entityUrl}/ProfileComment` +
    `?filter.profileUserId=${encodeURIComponent(profileUserId)}` +
    `&sort.createdAt=asc&limit=200`
  const r = await fetch(url, { headers: authHeader })
  if (!r.ok) return []
  const json = await r.json()
  return json.data?.data ?? json.data ?? []
}

export async function dbalCreateProfileComment(
  entityUrl: string,
  comment: ProfileComment,
  authHeader: Record<string, string>,
): Promise<ProfileComment> {
  const r = await fetch(`${entityUrl}/ProfileComment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ ...comment, tenantId: DBAL_TENANT }),
  })
  if (!r.ok) throw new Error(`Failed to create comment: ${r.statusText}`)
  const json = await r.json()
  return json.data ?? json
}
