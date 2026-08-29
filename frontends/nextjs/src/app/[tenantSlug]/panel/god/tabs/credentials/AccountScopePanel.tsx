'use client'

import { Chip, Typography } from '@/m3'
import { tenantLabel } from '../credentials-data'
import type { Notice, UserRecord } from '../credentials-types'
import { AccountList, type Viewer } from './AccountList'
import { NoticeAlert } from './NoticeAlert'
import { TenantSelect } from './TenantSelect'
import s from '../CredentialsTab.module.scss'

export interface AccountScopePanelProps {
  accounts: UserRecord[]
  viewer: Viewer
  appliedScope: string
  scope: string
  tenantOptions: string[]
  notice: Notice | null
  loading: boolean
  saving: boolean
  onScopeChange: (value: string) => void
  onPick: (account: UserRecord) => void
}

export function AccountScopePanel(props: AccountScopePanelProps) {
  return (
    <section className={s.panel}>
      <div className={s.panelHeader}>
        <div>
          <Typography variant="subtitle2">Account scope</Typography>
          <p>Current view: {tenantLabel(props.appliedScope)}</p>
        </div>
        <Chip
          label={`${props.accounts.length} visible`}
          size="small"
          variant="outlined"
        />
      </div>

      {props.viewer.isSupergod && (
        <TenantSelect
          label="Tenant view"
          value={props.scope}
          options={props.tenantOptions}
          includeAll
          onChange={props.onScopeChange}
        />
      )}

      <NoticeAlert notice={props.notice} />

      <div className={s.credentialList}>
        <AccountList
          accounts={props.accounts}
          viewer={props.viewer}
          loading={props.loading}
          saving={props.saving}
          onPick={props.onPick}
        />
      </div>
    </section>
  )
}
