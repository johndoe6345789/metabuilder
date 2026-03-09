import { createSlice, createAsyncThunk, type Action } from '@reduxjs/toolkit'
import type { Snippet, SnippetRevision, SnippetFile } from '@/lib/types'
import { getStorageConfig } from '@/lib/storage'
import { getAuthToken } from '@/lib/authToken'

const DBAL_TENANT = 'pastebin'
const DBAL_PACKAGE = 'pastebin'

function dbalBaseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '')
}

function entityUrl(entity: string): string {
  return `${dbalBaseUrl()}/${DBAL_TENANT}/${DBAL_PACKAGE}/${entity}`
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getUserId(): string {
  const token = getAuthToken()
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? ''
  } catch {
    return ''
  }
}

function parseFiles(raw: unknown): SnippetFile[] | undefined {
  if (!raw) return undefined
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return undefined
    }
  }
  return raw as SnippetFile[]
}

function toRevision(raw: Record<string, unknown>): SnippetRevision {
  return {
    id: raw.id as string,
    snippetId: raw.snippetId as string,
    code: raw.code as string,
    files: parseFiles(raw.files),
    createdAt: Number(raw.createdAt) || 0,
  }
}

function toSnippet(raw: Record<string, unknown>): Snippet {
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: (raw.description as string) ?? '',
    code: raw.code as string,
    language: raw.language as string,
    category: (raw.category as string) ?? '',
    namespaceId: raw.namespaceId as string | undefined,
    hasPreview: raw.hasPreview as boolean | undefined,
    isTemplate: raw.isTemplate as boolean | undefined,
    functionName: raw.functionName as string | undefined,
    inputParameters: typeof raw.inputParameters === 'string'
      ? JSON.parse(raw.inputParameters || '[]')
      : (raw.inputParameters as Snippet['inputParameters']),
    files: parseFiles(raw.files),
    entryPoint: raw.entryPoint as string | undefined,
    createdAt: Number(raw.createdAt) || 0,
    updatedAt: Number(raw.updatedAt) || Number(raw.createdAt) || 0,
    shareToken: raw.shareToken as string | undefined,
  }
}

interface RevisionsState {
  bySnippetId: Record<string, SnippetRevision[]>
  loading: boolean
  error: string | null
}

const initialState: RevisionsState = {
  bySnippetId: {},
  loading: false,
  error: null,
}

export const fetchRevisions = createAsyncThunk(
  'revisions/fetch',
  async (snippetId: string) => {
    const url = `${entityUrl('SnippetRevision')}?filter.snippetId=${encodeURIComponent(snippetId)}&sort=-createdAt`
    const r = await fetch(url, { headers: authHeaders() })
    if (!r.ok) throw new Error(`Failed to fetch revisions: ${r.statusText}`)
    const json = await r.json()
    const items: Record<string, unknown>[] = json.data?.data ?? json.data ?? []
    return { snippetId, revisions: items.map(toRevision) }
  }
)

export const revertToRevision = createAsyncThunk(
  'revisions/revert',
  async ({ snippetId, revisionId }: { snippetId: string; revisionId: string }) => {
    // Fetch the target revision
    const revRes = await fetch(`${entityUrl('SnippetRevision')}/${revisionId}`, {
      headers: authHeaders(),
    })
    if (!revRes.ok) throw new Error(`Failed to fetch revision: ${revRes.statusText}`)
    const revJson = await revRes.json()
    const revision = toRevision(revJson.data ?? revJson)

    // Update the snippet with the revision's code/files
    const body: Record<string, unknown> = {
      code: revision.code,
      updatedAt: Date.now(),
    }
    if (revision.files) {
      body.files = JSON.stringify(revision.files)
    }

    const updateRes = await fetch(`${entityUrl('Snippet')}/${snippetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!updateRes.ok) throw new Error(`Failed to revert snippet: ${updateRes.statusText}`)
    const updateJson = await updateRes.json()
    return toSnippet(updateJson.data ?? updateJson)
  }
)

export const forkSnippet = createAsyncThunk(
  'revisions/fork',
  async ({ snippetId, title }: { snippetId: string; title: string }) => {
    // Fetch the original snippet
    const origRes = await fetch(`${entityUrl('Snippet')}/${snippetId}`, {
      headers: authHeaders(),
    })
    if (!origRes.ok) throw new Error(`Failed to fetch snippet: ${origRes.statusText}`)
    const origJson = await origRes.json()
    const original = toSnippet(origJson.data ?? origJson)

    // Create a new snippet with the forked data
    const userId = getUserId()
    const body: Record<string, unknown> = {
      id: crypto.randomUUID(),
      title,
      description: original.description,
      code: original.code,
      language: original.language,
      category: original.category,
      namespaceId: original.namespaceId,
      hasPreview: original.hasPreview ?? false,
      isTemplate: false,
      functionName: original.functionName ?? null,
      inputParameters: original.inputParameters ? JSON.stringify(original.inputParameters) : '[]',
      files: original.files ? JSON.stringify(original.files) : null,
      entryPoint: original.entryPoint ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId,
      tenantId: DBAL_TENANT,
    }

    const createRes = await fetch(entityUrl('Snippet'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!createRes.ok) throw new Error(`Failed to fork snippet: ${createRes.statusText}`)
    const createJson = await createRes.json()
    return toSnippet(createJson.data ?? createJson)
  }
)

export const forkSharedSnippet = createAsyncThunk(
  'revisions/forkShared',
  async ({ token, title }: { token: string; title: string }) => {
    // Find snippet by shareToken
    const searchUrl = `${entityUrl('Snippet')}?filter.shareToken=${encodeURIComponent(token)}&limit=1`
    const searchRes = await fetch(searchUrl, { headers: authHeaders() })
    if (!searchRes.ok) throw new Error(`Failed to find shared snippet: ${searchRes.statusText}`)
    const searchJson = await searchRes.json()
    const items: Record<string, unknown>[] = searchJson.data?.data ?? searchJson.data ?? []
    if (items.length === 0) throw new Error('Shared snippet not found')
    const original = toSnippet(items[0])

    // Create a new snippet with the forked data
    const userId = getUserId()
    const body: Record<string, unknown> = {
      id: crypto.randomUUID(),
      title,
      description: original.description,
      code: original.code,
      language: original.language,
      category: original.category,
      hasPreview: original.hasPreview ?? false,
      isTemplate: false,
      functionName: original.functionName ?? null,
      inputParameters: original.inputParameters ? JSON.stringify(original.inputParameters) : '[]',
      files: original.files ? JSON.stringify(original.files) : null,
      entryPoint: original.entryPoint ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId,
      tenantId: DBAL_TENANT,
    }

    const createRes = await fetch(entityUrl('Snippet'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!createRes.ok) throw new Error(`Failed to fork shared snippet: ${createRes.statusText}`)
    const createJson = await createRes.json()
    return toSnippet(createJson.data ?? createJson)
  }
)

const revisionsSlice = createSlice({
  name: 'revisions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevisions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRevisions.fulfilled, (state, action) => {
        state.loading = false
        state.bySnippetId[action.payload.snippetId] = action.payload.revisions
      })
      .addCase(fetchRevisions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch revisions'
      })
      .addCase(revertToRevision.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(revertToRevision.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(revertToRevision.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to revert to revision'
      })
      .addCase(forkSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forkSnippet.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forkSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fork snippet'
      })
      .addCase(forkSharedSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forkSharedSnippet.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forkSharedSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fork shared snippet'
      })
      .addMatcher(
        (action: Action) => action.type === 'persist/REHYDRATE',
        (state) => {
          state.loading = false
          state.error = null
        },
      )
  },
})

export default revisionsSlice.reducer
