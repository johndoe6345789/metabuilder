'use client'

import { useRouter } from 'next/navigation'
import { Button, TextField } from '@/m3'
import { tenantPath } from '@/lib/tenant/workspace-paths'
import { useCurrentTenantScope } from '../use-current-tenant-scope'
import s from '../UsersTab.module.scss'

export interface UsersToolbarProps {
  query: string
  onQueryChange: (value: string) => void
}

/** Search, and the shortcut to the full admin panel. */
export function UsersToolbar({ query, onQueryChange }: UsersToolbarProps) {
  const { tenant } = useCurrentTenantScope()
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
          // The router adds the basePath itself: with BASE_PATH here too
          // this went to /app/app/admin, the one router.push in the app
          // that did, and it was not tenant-scoped either.
          router.push(tenantPath(tenant, '/admin'))
        }}
      >
        Open Admin Panel
      </Button>
    </div>
  )
}
