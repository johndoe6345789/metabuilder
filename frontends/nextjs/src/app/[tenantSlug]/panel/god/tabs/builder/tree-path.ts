/**
 * Where the draft tree in the store is live -- the path it was last loaded
 * from or published to -- so the publish bar can tell "already live there"
 * from "not yet".
 *
 * Kept in localStorage beside the tenant marker rather than in React
 * state, for the same reason as that marker: the case that matters is a
 * founder coming back in a new page load, whose tree is rehydrated from
 * IndexedDB and never loaded through anything that could record it. It
 * is only believed when the tenant marker names the same tenant; after
 * a tenant switch the tree it described has been blanked.
 */

import { readTreeTenant, writeTreeTenant } from './tree-tenant'

export const TREE_PATH_KEY = 'metabuilder:builder-live-path'

/** The path this tenant's stored tree is live at, or null if unknown. */
export function readTreePath(tenant: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    if (readTreeTenant() !== tenant) return null
    return window.localStorage.getItem(TREE_PATH_KEY)
  } catch {
    return null
  }
}

/** Record that the stored tree is now live at `path` for `tenant`. */
export function writeTreePath(tenant: string, path: string): void {
  if (typeof window === 'undefined') return
  try {
    writeTreeTenant(tenant)
    window.localStorage.setItem(TREE_PATH_KEY, path)
  } catch {
    // Without storage there is nothing to remember; the next mount reads
    // null, which the publish bar treats as "not known to be live".
  }
}
