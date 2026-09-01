'use client'

import { useCallback, useState } from 'react'
import { getRoleLevel } from '@/lib/constants'
import { setCredential } from './credentials-api'
import { normalizeTenant } from './credentials-data'
import { effectiveScope, SUPERGOD_LEVEL } from './credentials-scope'
import { refuseCredential } from './credentials-validation'
import { useCredentialAccounts } from './use-credential-accounts'
import type { UserRecord } from './credentials-types'

export interface CredentialsViewer {
  username?: string
  role?: string | null
  tenantId?: string | null
}

/** The credentials tab's state, and the one write it can make. */
export function useCredentials(viewer: CredentialsViewer) {
  const level = getRoleLevel(viewer.role ?? 'public')
  const isSupergod = level >= SUPERGOD_LEVEL
  const ownTenant = normalizeTenant(viewer.tenantId)

  const [scope, setScope] = useState(isSupergod ? 'all' : ownTenant)
  const [createTenant, setCreateTenant] = useState(ownTenant)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const appliedScope = effectiveScope(isSupergod, scope, ownTenant)
  const list = useCredentialAccounts(appliedScope, isSupergod, ownTenant)

  // A god's chosen scope is pinned to their own tenant, so a stale
  // selection cannot survive a change of viewer. Adjusted during render
  // (the documented React pattern for state that tracks props) instead
  // of an effect, so the stale scope is never committed to a paint.
  const [prevViewer, setPrevViewer] = useState({ isSupergod, ownTenant })
  if (
    !isSupergod &&
    (prevViewer.isSupergod !== isSupergod || prevViewer.ownTenant !== ownTenant)
  ) {
    setPrevViewer({ isSupergod, ownTenant })
    setScope(ownTenant)
    setCreateTenant(ownTenant)
  }

  const save = useCallback(async () => {
    const target = isSupergod ? normalizeTenant(createTenant) : ownTenant
    const refusal = refuseCredential(username, password)
    if (refusal !== null) {
      list.setNotice({ kind: 'error', message: refusal })
      return false
    }

    setSaving(true)
    try {
      await setCredential(username.trim(), password.trim(), target)
      setUsername('')
      setPassword('')
      await list.reload()
      list.setNotice({
        kind: 'success',
        message: `Password set for ${username.trim()} in ${target}.`,
      })
      return true
    } catch (error) {
      list.setNotice({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Credential could not be saved.',
      })
      return false
    } finally {
      setSaving(false)
    }
  }, [createTenant, isSupergod, list, ownTenant, password, username])

  const pick = useCallback((account: UserRecord) => {
    setUsername(account.username ?? '')
    setCreateTenant(normalizeTenant(account.tenantId))
    setPassword('')
  }, [])

  return {
    ...list,
    viewer: { isSupergod, level, tenant: ownTenant, name: viewer.username },
    scope,
    appliedScope,
    setScope,
    createTenant,
    setCreateTenant,
    username,
    setUsername,
    password,
    setPassword,
    saving,
    save,
    pick,
  }
}
