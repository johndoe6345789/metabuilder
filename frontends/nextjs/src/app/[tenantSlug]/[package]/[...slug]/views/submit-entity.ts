'use client'

import { BASE_PATH } from '@/lib/app-config'

export interface SubmitTarget {
  tenant: string
  pkg: string
  entity: string
  /** Set when changing a row; absent when creating one. */
  id?: string
}

/**
 * Writes the row through this app's own entity API.
 *
 * From the browser, so the session cookie identifies the operator --
 * `getSessionUser` accepts it now, which is what made this surface
 * reachable at all. fetch() does not get the basePath the way Link and
 * the router do, so it is added here.
 */
export async function submitEntity(
  target: SubmitTarget,
  row: Record<string, unknown>
): Promise<string | null> {
  const base = `${BASE_PATH}/api/v1/${target.tenant}/${target.pkg}/${target.entity}`
  const url = target.id === undefined ? base : `${base}/${target.id}`
  try {
    const res = await fetch(url, {
      method: target.id === undefined ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(row),
    })
    if (res.ok) return null
    const body = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    // The server's own words where it has any: "Field is required" is
    // worth more to whoever is filling the form in than "HTTP 422".
    return body?.error ?? `The data layer refused it (HTTP ${res.status}).`
  } catch {
    return 'Could not reach the server. Nothing was saved.'
  }
}
