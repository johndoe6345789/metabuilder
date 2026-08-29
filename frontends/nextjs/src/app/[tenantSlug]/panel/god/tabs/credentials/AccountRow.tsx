'use client'

import { Button, Chip } from '@/m3'
import { normalizeTenant } from '../credentials-data'
import type { UserRecord } from '../credentials-types'
import s from '../CredentialsTab.module.scss'

export interface AccountRowProps {
  account: UserRecord
  isSelf: boolean
  outranks: boolean
  canManage: boolean
  disabled: boolean
  onPick: (account: UserRecord) => void
}

/** One account, and whether this viewer may set its password. */
export function AccountRow({
  account,
  isSelf,
  outranks,
  canManage,
  disabled,
  onPick,
}: AccountRowProps) {
  const tenant = normalizeTenant(account.tenantId)

  return (
    <article className={s.credentialRow}>
      <div className={s.credentialIcon}>
        <span className="material-symbols-rounded">key</span>
      </div>
      <div className={s.credentialMain}>
        <strong>{account.username}</strong>
        <span>
          {tenant}
          {account.role != null ? ` · ${account.role}` : ''}
        </span>
      </div>
      <div className={s.rowActions}>
        {isSelf && <Chip label="current login" size="small" variant="outlined" />}
        {outranks && (
          <Chip label="supergod protected" size="small" variant="outlined" />
        )}
        <Button
          variant="outlined"
          size="small"
          disabled={!canManage || disabled}
          onClick={() => {
            onPick(account)
          }}
        >
          Set password
        </Button>
      </div>
    </article>
  )
}
