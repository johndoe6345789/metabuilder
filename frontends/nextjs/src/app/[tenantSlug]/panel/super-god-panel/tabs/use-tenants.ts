import { useState, useEffect } from 'react'
import { readList } from '@/lib/db/read-list'
import {
  communitiesFromUsers,
  type Community,
  type UserRow,
} from './communities-from-users'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export type Tenant = Community

/** Tenant list plus create/delete, kept out of the tab so it only owns
 *  what to render. */
export function useTenants(ownerId: string | undefined) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [unreachable, setUnreachable] = useState(false)

  useEffect(() => {
    // There is no Tenant entity to ask for -- this used to request
    // `/system/core/tenant`, take the 404 as "no tenants" and show an
    // empty list for ever. A community exists if it has anyone in it,
    // which is the rule tenant-exists.ts applies too.
    fetch(`${DBAL_URL}/system/core/User`, {
      credentials: 'include',
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('refused'))))
      .then((json: unknown) => {
        setTenants(communitiesFromUsers(readList<UserRow>(json)))
        setUnreachable(false)
      })
      .catch(() => {
        // An empty list and an unreadable one look identical on screen,
        // and this is the instance owner's only view of what exists.
        setUnreachable(true)
      })
  }, [])

  /**
   * Shows a community that does not exist yet.
   *
   * A community is made by someone signing up -- that is what writes the
   * founder's account, their credential and the tenant they own. Nothing
   * here can conjure one, and this only ever added a row to a list in
   * memory that the next load forgot. Kept, and marked, so the tab can
   * say that rather than pretending: see TenantsTab.
   */
  const create = (name: string) => {
    setTenants(prev => [
      ...prev,
      {
        id: name,
        name,
        ownerId: ownerId ?? 'unknown',
        ownerName: 'not created yet',
        members: 0,
        createdAt: Date.now(),
      },
    ])
  }

  const remove = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id))
  }

  return { tenants, create, remove, unreachable }
}
