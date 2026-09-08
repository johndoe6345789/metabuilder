/** A snapshot of the collections the god panel can export. */

import { DBAL_URL } from './dbal-status'

const TIMEOUT_MS = 8000

/**
 * What gets exported, and where each part comes from within a community.
 *
 * These paths were fixed at `/system/...`, so a founder in their own
 * community pressed "Export Database", was told the export had been
 * downloaded, and got a file of the *shared* tenant's users, workflows and
 * pages -- somebody else's data, offered to them as their own backup.
 */
export const EXPORTED_COLLECTIONS = [
  ['users', 'core/User'],
  ['workflows', 'core/Workflow'],
  ['pages', 'core/PageConfig'],
  ['styleClasses', 'core/StyleClass'],
] as const

export interface DatabaseExport {
  exportedAt: string
  /** Whose data this is. Recorded in the file so a restore cannot put one
   *  community's rows into another by accident. */
  tenant: string
  dbalVersion: string | null
  data: Record<string, unknown>
}

/**
 * A collection that cannot be read is recorded as an error inside the
 * file rather than failing the whole export -- a partial snapshot with
 * the gaps named is more use than none.
 */
export async function buildDatabaseExport(
  tenant: string,
  dbalVersion: string | null,
  now: string = new Date().toISOString()
): Promise<DatabaseExport> {
  const data: Record<string, unknown> = {}
  for (const [key, path] of EXPORTED_COLLECTIONS) {
    const res = await fetch(`${DBAL_URL}/${tenant}/${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    data[key] = res.ok ? await res.json() : { error: `HTTP ${res.status}` }
  }
  return { exportedAt: now, tenant, dbalVersion, data }
}

export function exportFileName(
  tenant: string,
  now: string = new Date().toISOString()
): string {
  return `metabuilder-${tenant}-${now}.json`
}
