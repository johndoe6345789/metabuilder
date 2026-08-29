'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { AccountScopePanel } from './credentials/AccountScopePanel'
import { CredentialsHeader } from './credentials/CredentialsHeader'
import { SetPasswordPanel } from './credentials/SetPasswordPanel'
import { useCredentials } from './use-credentials'
import s from './CredentialsTab.module.scss'

/**
 * Accounts, not credentials.
 *
 * Credential is schema.acl.system, so its rows can never be listed through
 * the entity API -- only User can, and a credential is set for a username,
 * so User is the right thing to show.
 */
export function CredentialsTab() {
  const user = useAuthContext().user
  const state = useCredentials({
    username: user?.username,
    role: user?.role,
    tenantId: user?.tenantId,
  })

  return (
    <div className={s.root}>
      <CredentialsHeader
        isSupergod={state.viewer.isSupergod}
        ownTenant={state.viewer.tenant}
      />

      <div className={s.grid}>
        <AccountScopePanel
          accounts={state.accounts}
          viewer={state.viewer}
          appliedScope={state.appliedScope}
          scope={state.scope}
          tenantOptions={state.tenantOptions}
          notice={state.notice}
          loading={state.loading}
          saving={state.saving}
          onScopeChange={state.setScope}
          onPick={state.pick}
        />

        <SetPasswordPanel
          isSupergod={state.viewer.isSupergod}
          ownTenant={state.viewer.tenant}
          createTenant={state.createTenant}
          tenantOptions={state.tenantOptions}
          username={state.username}
          password={state.password}
          saving={state.saving}
          onTenantChange={state.setCreateTenant}
          onUsernameChange={state.setUsername}
          onPasswordChange={state.setPassword}
          onSubmit={() => {
            void state.save()
          }}
        />
      </div>
    </div>
  )
}
