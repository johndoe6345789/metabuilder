'use client'

import { Chip, Select } from '@/m3'
import type { UserRole } from '@/lib/constants'
import type { UserRow } from '../users-data'
import { assignableRoles, mayChangeRole } from '../users-roles'

export interface RoleCellProps {
  user: UserRow
  caller: { id?: string; role?: string }
  onChange: (user: UserRow, role: UserRole) => void
}

/**
 * The account's role: a picker when the viewer may change it, a chip when
 * they may not -- their own account, a peer, anyone above them.
 */
export function RoleCell({ user, caller, onChange }: RoleCellProps) {
  const role = user.role ?? 'user'
  if (!mayChangeRole(caller, user)) {
    return <Chip label={role} size="small" variant="outlined" />
  }

  const choices = assignableRoles(caller.role)
  return (
    <Select
      native
      value={role}
      inputProps={{ 'aria-label': `Role of ${user.username ?? user.id}` }}
      onChange={
        ((event: React.ChangeEvent<HTMLSelectElement>) => {
          onChange(user, event.target.value as UserRole)
        }) as never
      }
    >
      {choices.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
  )
}
