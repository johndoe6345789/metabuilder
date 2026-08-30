'use client'

import { useEffect, useMemo, useState } from 'react'
import { countByRole, fetchUsers, filterUsers, type UserRow } from './users-data'

/** The user list's state: what loaded, the search, and the derived views. */
export function useUsersTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetchUsers()
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
  }, [])

  return {
    query,
    setQuery,
    loading,
    error,
    filtered: useMemo(() => filterUsers(users, query), [query, users]),
    roleCounts: useMemo(() => countByRole(users), [users]),
  }
}
