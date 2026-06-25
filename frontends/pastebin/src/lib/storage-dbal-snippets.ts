/**
 * DBAL snippet parsers and barrel
 */

import type { Snippet } from './types'

const DBAL_TENANT = 'pastebin'

/** Parse a timestamp that may arrive as epoch millis or an ISO string. */
function toEpoch(v: unknown): number {
  return Number(v) || Date.parse(String(v ?? '')) || 0
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
    files:
      typeof raw.files === 'string'
        ? JSON.parse(raw.files || '[]')
        : (raw.files as Snippet['files']),
    entryPoint: raw.entryPoint as string | undefined,
    createdAt: toEpoch(raw.createdAt),
    updatedAt: toEpoch(raw.updatedAt) || toEpoch(raw.createdAt),
    shareToken: raw.shareToken as string | undefined,
  }
}

export function snippetToBody(
  snippet: Snippet,
  userId: string,
): Record<string, unknown> {
  return {
    title: snippet.title,
    description: snippet.description || '',
    code: snippet.code,
    language: snippet.language,
    category: snippet.category || 'general',
    namespaceId: snippet.namespaceId,
    hasPreview: snippet.hasPreview ?? false,
    isTemplate: snippet.isTemplate ?? false,
    functionName: snippet.functionName ?? null,
    inputParameters: snippet.inputParameters
      ? JSON.stringify(snippet.inputParameters)
      : '[]',
    files: snippet.files ? JSON.stringify(snippet.files) : null,
    entryPoint: snippet.entryPoint ?? null,
    updatedAt: snippet.updatedAt || Date.now(),
    userId,
    tenantId: DBAL_TENANT,
    shareToken: snippet.shareToken ?? null,
  }
}

export {
  dbalGetAllSnippets,
  dbalGetSnippet,
  dbalCreateSnippet,
  dbalUpdateSnippet,
  dbalDeleteSnippet,
  dbalGetSnippetsByNamespace,
  dbalBulkMoveSnippets,
} from './storage-dbal-snippet-ops'
