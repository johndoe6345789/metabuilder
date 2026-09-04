'use client'

import { FormControl, FormLabel, Select, Typography } from '@/m3'
import s from '../ComponentTreeTab.module.scss'

/**
 * role is a closed vocabulary, and a free text box let "nav", "Navigation"
 * or a trailing space through -- each of which lands on the element as
 * role="..." and *replaces* its real meaning for a screen reader. A wrong
 * role is worse than none, so the field that exists to help people who
 * cannot see the page should not be the one that takes dictation.
 */
const ROLES = [
  'alert',
  'banner',
  'complementary',
  'contentinfo',
  'dialog',
  'main',
  'navigation',
  'none',
  'region',
  'search',
  'status',
]

export interface RoleFieldProps {
  role: string
  onChange: (patch: Record<string, unknown>) => void
}

export function RoleField({ role, onChange }: RoleFieldProps) {
  // A role set before this was a dropdown -- or by BQL, or by hand -- stays
  // selectable rather than being silently dropped on the next edit.
  const choices = ROLES.includes(role) || role === '' ? ROLES : [...ROLES, role]

  return (
    <FormControl>
      <FormLabel htmlFor="a11y-role">Role</FormLabel>
      <Select
        native
        value={role}
        inputProps={{ id: 'a11y-role' }}
        onChange={
          ((event: React.ChangeEvent<HTMLSelectElement>) => {
            onChange({ role: event.target.value })
          }) as never
        }
      >
        <option value="">Its own meaning</option>
        {choices.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Typography variant="caption" className={s.propHint}>
        Only when the element&apos;s own meaning is wrong
      </Typography>
    </FormControl>
  )
}
