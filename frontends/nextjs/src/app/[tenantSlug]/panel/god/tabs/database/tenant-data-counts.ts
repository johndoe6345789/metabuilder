/**
 * How much of each thing this community actually has.
 *
 * The tab lists the backends DBAL *can* run on, which a founder can
 * neither change nor act on -- and nothing anywhere showed them their own
 * data. These are the same collections the export writes, so what the
 * tab counts and what a backup contains cannot drift apart.
 */

import { readList } from '@/lib/db/read-list'
import { DBAL_URL } from '../overview/dbal-status'
import { EXPORTED_COLLECTIONS } from '../overview/database-export'

/** Counting stops here; a bigger table is reported as "500+". */
export const COUNT_LIMIT = 500

export interface CollectionCount {
  /** The name the export uses, e.g. "formSubmissions". */
  key: string
  /** The DBAL path, e.g. "core/FormSubmission". */
  path: string
  /** Rows found, or null when the collection could not be read. */
  rows: number | null
  /** True when there were at least as many rows as the limit. */
  more: boolean
}

/** Turns "formSubmissions" into "Form submissions". */
export function collectionLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** What to show for one collection. */
export function countLabel(count: CollectionCount): string {
  if (count.rows === null) return 'could not read'
  return count.more ? `${count.rows}+` : String(count.rows)
}

async function countOne(
  tenant: string,
  key: string,
  path: string
): Promise<CollectionCount> {
  try {
    const res = await fetch(
      `${DBAL_URL}/${tenant}/${path}?limit=${COUNT_LIMIT}`,
      { credentials: 'include', signal: AbortSignal.timeout(8000) }
    )
    // A collection that could not be read is not an empty one, and this
    // whole panel exists so a founder can tell the difference.
    if (!res.ok) return { key, path, rows: null, more: false }
    const rows = readList<unknown>(await res.json()).length
    return { key, path, rows, more: rows >= COUNT_LIMIT }
  } catch {
    return { key, path, rows: null, more: false }
  }
}

/** Every collection, counted for this community. */
export async function countTenantData(
  tenant: string
): Promise<CollectionCount[]> {
  return Promise.all(
    EXPORTED_COLLECTIONS.map(([key, path]) => countOne(tenant, key, path))
  )
}
