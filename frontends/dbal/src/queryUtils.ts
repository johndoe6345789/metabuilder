import type { HttpMethod, QueryHistoryEntry } from './types'
import cfg from './data/queryConsole.json'

export { parseCli } from './parseCli'

const { storageKeys, maxHistory } = cfg

export function isPlainOutput(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'output' in data &&
    typeof (data as { output: unknown }).output === 'string'
  )
}

export function loadHistory(): QueryHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKeys.history)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(entries: QueryHistoryEntry[]) {
  try {
    localStorage.setItem(
      storageKeys.history,
      JSON.stringify(entries),
    )
  } catch { /* quota exceeded */ }
}

export function addToHistory(
  entry: QueryHistoryEntry,
  current: QueryHistoryEntry[],
): QueryHistoryEntry[] {
  const updated = [entry, ...current].slice(0, maxHistory)
  saveHistory(updated)
  return updated
}

export function methodColor(m: HttpMethod): string {
  switch (m) {
    case 'GET':    return '#4ade80'
    case 'POST':   return '#60a5fa'
    case 'PUT':    return '#fbbf24'
    case 'DELETE': return '#f87171'
  }
}
