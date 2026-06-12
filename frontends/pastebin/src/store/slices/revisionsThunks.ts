import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  entityUrl,
  authHeaders,
  getUserId,
  toRevision,
  toSnippet,
  buildForkBody,
} from './revisions-dbal'

export const fetchRevisions = createAsyncThunk(
  'revisions/fetch',
  async (snippetId: string) => {
    // eslint-disable-next-line max-len
    const url = `${entityUrl('SnippetRevision')}?filter.snippetId=${encodeURIComponent(snippetId)}&sort=-createdAt`
    const r = await fetch(url, { headers: authHeaders() })
    if (!r.ok) throw new Error(`Failed to fetch revisions: ${r.statusText}`)
    const json = await r.json()
    const items: Record<string, unknown>[] = json.data?.data ?? json.data ?? []
    return { snippetId, revisions: items.map(toRevision) }
  },
)

export const revertToRevision = createAsyncThunk(
  'revisions/revert',
  async ({
    snippetId,
    revisionId,
  }: {
    snippetId: string
    revisionId: string
  }) => {
    const revRes = await fetch(
      `${entityUrl('SnippetRevision')}/${revisionId}`,
      { headers: authHeaders() },
    )
    if (!revRes.ok)
      throw new Error(`Failed to fetch revision: ${revRes.statusText}`)
    const revJson = await revRes.json()
    const revision = toRevision(revJson.data ?? revJson)
    const body: Record<string, unknown> = {
      code: revision.code,
      updatedAt: Date.now(),
    }
    if (revision.files) body.files = JSON.stringify(revision.files)
    const updateRes = await fetch(`${entityUrl('Snippet')}/${snippetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!updateRes.ok)
      throw new Error(`Failed to revert snippet: ${updateRes.statusText}`)
    const updateJson = await updateRes.json()
    return toSnippet(updateJson.data ?? updateJson)
  },
)

export const forkSnippet = createAsyncThunk(
  'revisions/fork',
  async ({ snippetId, title }: { snippetId: string; title: string }) => {
    const origRes = await fetch(`${entityUrl('Snippet')}/${snippetId}`, {
      headers: authHeaders(),
    })
    if (!origRes.ok)
      throw new Error(`Failed to fetch snippet: ${origRes.statusText}`)
    const origJson = await origRes.json()
    const original = toSnippet(origJson.data ?? origJson)
    const body = buildForkBody(original, title, getUserId())
    const createRes = await fetch(entityUrl('Snippet'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!createRes.ok)
      throw new Error(`Failed to fork snippet: ${createRes.statusText}`)
    const createJson = await createRes.json()
    return toSnippet(createJson.data ?? createJson)
  },
)

export const forkSharedSnippet = createAsyncThunk(
  'revisions/forkShared',
  async ({ token, title }: { token: string; title: string }) => {
    // eslint-disable-next-line max-len
    const searchUrl = `${entityUrl('Snippet')}?filter.shareToken=${encodeURIComponent(token)}&limit=1`
    const searchRes = await fetch(searchUrl, { headers: authHeaders() })
    if (!searchRes.ok)
      throw new Error(`Failed to find shared snippet: ${searchRes.statusText}`)
    const searchJson = await searchRes.json()
    const items: Record<string, unknown>[] =
      searchJson.data?.data ?? searchJson.data ?? []
    if (items.length === 0) throw new Error('Shared snippet not found')
    const original = toSnippet(items[0])
    const body = {
      ...buildForkBody(original, title, getUserId()),
      namespaceId: undefined,
    }
    const createRes = await fetch(entityUrl('Snippet'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!createRes.ok)
      throw new Error(`Failed to fork shared snippet: ${createRes.statusText}`)
    const createJson = await createRes.json()
    return toSnippet(createJson.data ?? createJson)
  },
)
