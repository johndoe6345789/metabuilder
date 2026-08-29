'use client'

import { canManageAccount, outranksViewer } from '../credentials-scope'
import type { UserRecord } from '../credentials-types'
import { normalizeTenant } from '../credentials-data'
import { AccountRow } from './AccountRow'
import s from '../CredentialsTab.module.scss'

export interface Viewer {
  isSupergod: boolean
  level: number
  tenant: string
  name?: string
}

export interface AccountListProps {
  accounts: UserRecord[]
  viewer: Viewer
  loading: boolean
  saving: boolean
  onPick: (account: UserRecord) => void
}

export function AccountList({
  accounts,
  viewer,
  loading,
  saving,
  onPick,
}: AccountListProps) {
  if (loading) {
    return <div className={s.empty}>Loading accounts...</div>
  }
  if (accounts.length === 0) {
    return <div className={s.empty}>No accounts found for this scope.</div>
  }

  return (
    <>
      {accounts.map(account => (
        <AccountRow
          key={`${normalizeTenant(account.tenantId)}:${account.username ?? ''}`}
          account={account}
          isSelf={account.username === viewer.name}
          outranks={outranksViewer(account, viewer)}
          canManage={canManageAccount(account, viewer)}
          disabled={saving}
          onPick={onPick}
        />
      ))}
    </>
  )
}
