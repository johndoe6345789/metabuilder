'use client'

import { useCallback, useEffect, useState } from 'react'
import { deleteUser, fetchCommentCount, fetchUsers } from './admin-api'
import { buildStats, type EntityStat, type UserRecord } from './admin-types'

export type AdminStatus = 'loading' | 'ready' | 'unreachable'

export interface AdminData {
  users: UserRecord[]
  stats: EntityStat[]
  commentCount: number
  status: AdminStatus
  removeUser: (id: string) => Promise<boolean>
}

/**
 * The panel's data.
 *
 * A failed load says so. It used to substitute two invented accounts --
 * `demo` and `admin` -- which is the worst possible fallback for a screen
 * whose whole job is to tell an operator who really has an account.
 */
export function useAdminData(): AdminData {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [status, setStatus] = useState<AdminStatus>('loading')

  useEffect(() => {
    let live = true
    void Promise.all([fetchUsers(), fetchCommentCount()]).then(
      ([rows, comments]) => {
        if (!live) return
        setUsers(rows ?? [])
        setCommentCount(comments ?? 0)
        setStatus(rows === null ? 'unreachable' : 'ready')
      }
    )
    return () => {
      live = false
    }
  }, [])

  const removeUser = useCallback(async (id: string): Promise<boolean> => {
    const ok = await deleteUser(id)
    if (ok) setUsers(prev => prev.filter(u => u.id !== id))
    return ok
  }, [])

  return {
    users,
    stats: buildStats(users, commentCount),
    commentCount,
    status,
    removeUser,
  }
}
