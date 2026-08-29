'use client'

import { Button, Typography } from '@/m3'
import { CredentialFields } from './CredentialFields'
import { TenantSelect } from './TenantSelect'
import s from '../CredentialsTab.module.scss'

function PanelIntro() {
  return (
    <div className={s.panelHeader}>
      <div>
        <Typography variant="subtitle2">Set a password</Typography>
        <p>
          The password is hashed by DBAL with Argon2id and is never shown
          again. Setting one for an existing username replaces it.
        </p>
      </div>
    </div>
  )
}

export interface SetPasswordPanelProps {
  isSupergod: boolean
  ownTenant: string
  createTenant: string
  tenantOptions: string[]
  username: string
  password: string
  saving: boolean
  onTenantChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

export function SetPasswordPanel(props: SetPasswordPanelProps) {
  return (
    <aside className={s.panel}>
      <PanelIntro />
      <div className={s.form}>
        {props.isSupergod ? (
          <TenantSelect
            label="Tenant"
            value={props.createTenant}
            options={props.tenantOptions}
            onChange={props.onTenantChange}
          />
        ) : (
          <div className={s.tenantLock}>
            <span className="material-symbols-rounded">lock</span>
            Setting in <strong>{props.ownTenant}</strong>
          </div>
        )}

        <CredentialFields
          username={props.username}
          password={props.password}
          onUsernameChange={props.onUsernameChange}
          onPasswordChange={props.onPasswordChange}
        />
        <Button
          variant="contained"
          size="small"
          disabled={props.saving}
          onClick={props.onSubmit}
        >
          {props.saving ? 'Saving...' : 'Set password'}
        </Button>
      </div>
    </aside>
  )
}
