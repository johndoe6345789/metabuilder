'use client'

import { useEffect, useMemo, useState } from 'react'
import { countByRole, fetchUsers, filterUsers, type UserRow } from './users-data'
import { useCurrentTenantScope } from './use-current-tenant-scope'

/** The user list's state: what loaded, the search, and the derived views. */
export function useUsersTab() {
  // Scoped like every other God Panel tool: a founder is their own
  // community's god, not an instance-wide admin.
  const { tenant } = useCurrentTenantScope()
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetchUsers(tenant)
      .then(rows => {
        if (!live) return
        setUsers(rows)
        setError(null)
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : 'Failed to load users')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
    // Re-runs if the tenant ever changes without a remount. `loading` is
    // not reset here: it starts true, and switching tenant in this app is
    // always a full page reload through the SSO flow, so the only way to
    // reach this effect a second time is a remount that resets it anyway.
  }, [tenant])

  return {
    query,
    setQuery,
    loading,
    error,
    filtered: useMemo(() => filterUsers(users, query), [query, users]),
    roleCounts: useMemo(() => countByRole(users), [users]),
  }
}
