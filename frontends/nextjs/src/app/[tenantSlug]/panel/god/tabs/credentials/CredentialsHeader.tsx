'use client'

import { Chip, Typography } from '@/m3'
import s from '../CredentialsTab.module.scss'

/** What this viewer may reach, said plainly at the top of the tab. */
export function CredentialsHeader({
  isSupergod,
  ownTenant,
}: {
  isSupergod: boolean
  ownTenant: string
}) {
  return (
    <header className={s.header}>
      <div>
        <Typography variant="h6">Tenant credentials</Typography>
        <p>
          {isSupergod
            ? 'Supergods can inspect and manage credentials across tenants.'
            : 'God users can create and manage credentials only inside ' +
              'their own tenant.'}
        </p>
      </div>
      <Chip
        label={isSupergod ? 'Supergod · all tenancies' : `God · ${ownTenant}`}
        size="small"
        className={s.scopeChip}
      />
    </header>
  )
}
