/** A snapshot of the collections the god panel can export. */

import { DBAL_URL } from './dbal-status'

const TIMEOUT_MS = 8000

/** What gets exported, and where each part comes from. */
export const EXPORTED_RESOURCES = [
  ['users', '/system/core/User'],
  ['workflows', '/system/core/Workflow'],
  ['pages', '/system/core/PageConfig'],
  ['styleClasses', '/system/core/StyleClass'],
] as const

export interface DatabaseExport {
  exportedAt: string
  dbalVersion: string | null
  data: Record<string, unknown>
}

/**
 * A collection that cannot be read is recorded as an error inside the
 * file rather than failing the whole export -- a partial snapshot with
 * the gaps named is more use than none.
 */
export async function buildDatabaseExport(
  dbalVersion: string | null,
  now: string = new Date().toISOString()
): Promise<DatabaseExport> {
  const data: Record<string, unknown> = {}
  for (const [key, path] of EXPORTED_RESOURCES) {
    const res = await fetch(`${DBAL_URL}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    data[key] = res.ok ? await res.json() : { error: `HTTP ${res.status}` }
  }
  return { exportedAt: now, dbalVersion, data }
}

export function exportFileName(now: string = new Date().toISOString()): string {
  return `metabuilder-export-${now}.json`
}
