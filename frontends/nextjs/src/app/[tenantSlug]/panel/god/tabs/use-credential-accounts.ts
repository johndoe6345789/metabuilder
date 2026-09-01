'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAccounts } from './credentials-api'
import { availableTenants, visibleAccounts } from './credentials-scope'
import type { Notice, TenantRecord, UserRecord } from './credentials-types'

export const LOAD_FAILED =
  'Accounts could not be loaded. Check DBAL access for system/core/User.'

/** The accounts in scope, reloaded whenever the scope changes. */
export function useCredentialAccounts(
  appliedScope: string,
  isSupergod: boolean,
  ownTenant: string
) {
  const [accounts, setAccounts] = useState<UserRecord[]>([])
  const [tenants, setTenants] = useState<TenantRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const result = await fetchAccounts(appliedScope, isSupergod)
      setAccounts(result.accounts)
      setTenants(result.tenants)
      return true
    } catch {
      // An unreachable data layer is not an empty tenancy, and this
      // screen must never imply that nobody has an account.
      setAccounts([])
      setNotice({ kind: 'error', message: LOAD_FAILED })
      return false
    } finally {
      setLoading(false)
    }
  }, [appliedScope, isSupergod])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  return {
    accounts: useMemo(
      () => visibleAccounts(accounts, appliedScope),
      [accounts, appliedScope]
    ),
    tenantOptions: useMemo(
      () => availableTenants(ownTenant, tenants),
      [ownTenant, tenants]
    ),
    loading,
    notice,
    setNotice,
    reload: load,
  }
}
