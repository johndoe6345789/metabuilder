import type { Snippet, SnippetRevision, SnippetFile } from '@/lib/types'
import { getStorageConfig } from '@/lib/storage'
import { getAuthToken } from '@/lib/authToken'

const DBAL_TENANT = 'pastebin'
const DBAL_PACKAGE = 'pastebin'

export function dbalBaseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '')
}

export function entityUrl(entity: string): string {
  return `${dbalBaseUrl()}/${DBAL_TENANT}/${DBAL_PACKAGE}/${entity}`
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getUserId(): string {
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

export function toRevision(raw: Record<string, unknown>): SnippetRevision {
  return {
    id: raw.id as string,
    snippetId: raw.snippetId as string,
    code: raw.code as string,
    files: parseFiles(raw.files),
    createdAt: Number(raw.createdAt) || 0,
  }
}

export function toSnippet(raw: Record<string, unknown>): Snippet {
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
    inputParameters:
      typeof raw.inputParameters === 'string'
        ? JSON.parse(raw.inputParameters || '[]')
        : (raw.inputParameters as Snippet['inputParameters']),
    files: parseFiles(raw.files),
    entryPoint: raw.entryPoint as string | undefined,
    createdAt: Number(raw.createdAt) || 0,
    updatedAt: Number(raw.updatedAt) || Number(raw.createdAt) || 0,
    shareToken: raw.shareToken as string | undefined,
  }
}

export function buildForkBody(
  original: Snippet,
  title: string,
  userId: string,
): Record<string, unknown> {
  return {
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
    inputParameters: original.inputParameters
      ? JSON.stringify(original.inputParameters)
      : '[]',
    files: original.files ? JSON.stringify(original.files) : null,
    entryPoint: original.entryPoint ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId,
    tenantId: DBAL_TENANT,
  }
}
