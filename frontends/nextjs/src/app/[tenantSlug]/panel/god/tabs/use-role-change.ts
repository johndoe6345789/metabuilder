'use client'

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import type { UserRole } from '@/lib/constants'
import type { UserRow } from './users-data'
import { updateUserRole } from './users-roles'

export interface RoleChange {
  /** Give this account a role. The list shows it at once; a refusal puts
   *  the old role back and explains itself. */
  changeRole: (user: UserRow, role: UserRole) => Promise<void>
  roleError: string | null
}

/** Changing one account's role in a list the caller owns. */
export function useRoleChange(
  tenant: string,
  setUsers: Dispatch<SetStateAction<UserRow[]>>
): RoleChange {
  const [roleError, setRoleError] = useState<string | null>(null)

  const setRoleOf = useCallback(
    (id: string, role: string | undefined) => {
      setUsers(users => users.map(u => (u.id === id ? { ...u, role } : u)))
    },
    [setUsers]
  )

  const changeRole = useCallback(
    async (user: UserRow, role: UserRole) => {
      const id = user.id
      if (id === undefined) return
      const before = user.role
      setRoleOf(id, role)
      try {
        await updateUserRole(tenant, id, role)
        setRoleError(null)
      } catch (e: unknown) {
        setRoleOf(id, before)
        const why = e instanceof Error ? e.message : 'the data layer refused'
        const who = user.username ?? id
        setRoleError(`Could not change ${who} to ${role}: ${why}`)
      }
    },
    [tenant, setRoleOf]
  )

  return { changeRole, roleError }
}
