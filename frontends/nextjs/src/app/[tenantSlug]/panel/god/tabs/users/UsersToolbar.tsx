'use client'

import { useRouter } from 'next/navigation'
import { Button, TextField } from '@/m3'
import { BASE_PATH } from '@/lib/app-config'
import s from '../UsersTab.module.scss'

export interface UsersToolbarProps {
  query: string
  onQueryChange: (value: string) => void
}

/** Search, and the shortcut to the full admin panel. */
export function UsersToolbar({ query, onQueryChange }: UsersToolbarProps) {
  const router = useRouter()

  return (
    <div className={s.toolbar}>
      <TextField
        label="Search users"
        size="small"
        value={query}
        onChange={e => {
          onQueryChange(e.target.value)
        }}
      />
      <Button
        variant="outlined"
        onClick={() => {
          router.push(`${BASE_PATH}/admin`)
        }}
      >
        Open Admin Panel
      </Button>
    </div>
  )
}
