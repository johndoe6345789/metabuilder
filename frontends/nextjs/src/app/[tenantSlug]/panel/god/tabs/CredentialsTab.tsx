'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Chip, TextField, Typography } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { getRoleLevel } from '@/lib/constants'
import { BASE_PATH } from '@/lib/app-config'
import s from './CredentialsTab.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

import type { Notice, TenantRecord, UserRecord } from './credentials-types'
import {
  normalizeTenant,
  tenantLabel,
  unwrapList,
} from './credentials-data'

export function CredentialsTab() {
  const auth = useAuthContext()
  const user = auth.user
  const userRole = user?.role ?? 'public'
  const userLevel = getRoleLevel(userRole)
  const isSupergod = userLevel >= 5
  const ownTenant = normalizeTenant(user?.tenantId)

  // Accounts, not credentials. Credential is schema.acl.system, so its rows
  // can never be listed through the entity API -- only User can, and a
  // credential is set for a username, so User is the right thing to show.
  const [accounts, setAccounts] = useState<UserRecord[]>([])
  const [tenants, setTenants] = useState<TenantRecord[]>([])
  const [tenantScope, setTenantScope] = useState(isSupergod ? 'all' : ownTenant)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [createTenant, setCreateTenant] = useState(ownTenant)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const effectiveTenantScope = isSupergod ? tenantScope : ownTenant
  const availableTenants = useMemo(() => {
    const ids = new Set<string>([ownTenant, 'system'])
    tenants.forEach(tenant => {
      if (tenant.id.length > 0) ids.add(tenant.id)
      if (tenant.slug != null && tenant.slug.length > 0) ids.add(tenant.slug)
    })
    return [...ids].sort((a, b) => a.localeCompare(b))
  }, [ownTenant, tenants])

  const visibleAccounts = useMemo(
    () =>
      accounts.filter(account =>
        effectiveTenantScope === 'all'
          ? true
          : normalizeTenant(account.tenantId) === effectiveTenantScope
      ),
    [accounts, effectiveTenantScope]
  )

  useEffect(() => {
    if (!isSupergod) {
      setTenantScope(ownTenant)
      setCreateTenant(ownTenant)
    }
  }, [isSupergod, ownTenant])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setNotice(null)

      try {
        const params = new URLSearchParams()
        if (effectiveTenantScope !== 'all') {
          params.set('filter.tenantId', effectiveTenantScope)
        }
        const query = params.size > 0 ? `?${params.toString()}` : ''

        const [userRes, tenantRes] = await Promise.all([
          fetch(`${DBAL_URL}/system/core/User${query}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          }),
          isSupergod
            ? fetch(`${DBAL_URL}/system/core/Tenant`, {
                cache: 'no-store',
                signal: AbortSignal.timeout(8000),
              }).catch(() => null)
            : Promise.resolve(null),
        ])

        if (!userRes.ok) {
          throw new Error(`User list failed with ${String(userRes.status)}`)
        }

        const userRaw = (await userRes.json()) as unknown
        const tenantRaw =
          tenantRes?.ok === true ? ((await tenantRes.json()) as unknown) : null

        if (!cancelled) {
          setAccounts(
            unwrapList<UserRecord>(userRaw).filter(
              account => account.username != null && account.username.length > 0
            )
          )
          setTenants(unwrapList<TenantRecord>(tenantRaw))
        }
      } catch {
        if (!cancelled) {
          setAccounts([])
          setNotice({
            kind: 'error',
            message:
              'Accounts could not be loaded. Check DBAL access for system/core/User.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [effectiveTenantScope, isSupergod])

  const refreshUsers = async () => {
    const params = new URLSearchParams()
    if (effectiveTenantScope !== 'all') {
      params.set('filter.tenantId', effectiveTenantScope)
    }
    const query = params.size > 0 ? `?${params.toString()}` : ''
    const res = await fetch(`${DBAL_URL}/system/core/User${query}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Account reload failed')
    const raw = (await res.json()) as unknown
    setAccounts(unwrapList<UserRecord>(raw))
  }

  const handleCreate = async () => {
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()
    const targetTenant = isSupergod ? normalizeTenant(createTenant) : ownTenant

    if (cleanUsername.length < 3 || cleanPassword.length < 8) {
      setNotice({
        kind: 'error',
        message:
          'Use a username of 3+ characters and a password of 8+ characters.',
      })
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      // The plaintext goes to our own origin, which attaches the admin token
      // server-side and lets DBAL hash it with Argon2id. Hashing here would
      // produce a digest verify_password cannot check -- see the route.
      const res = await fetch(`${BASE_PATH}/api/admin/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          tenantId: targetTenant,
        }),
      })

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string
      }
      if (!res.ok) {
        throw new Error(payload.error ?? 'Credential write refused')
      }

      setUsername('')
      setPassword('')
      setNotice({
        kind: 'success',
        message: `Password set for ${cleanUsername} in ${targetTenant}.`,
      })
      await refreshUsers()
    } catch (error) {
      setNotice({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Credential could not be saved.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={s.root}>
      <header className={s.header}>
        <div>
          <Typography variant="h6">Tenant credentials</Typography>
          <p>
            {isSupergod
              ? 'Supergods can inspect and manage credentials across tenants.'
              : 'God users can create and manage credentials only inside their own tenant.'}
          </p>
        </div>
        <Chip
          label={isSupergod ? 'Supergod · all tenancies' : `God · ${ownTenant}`}
          size="small"
          className={s.scopeChip}
        />
      </header>

      <div className={s.grid}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <Typography variant="subtitle2">Account scope</Typography>
              <p>Current view: {tenantLabel(effectiveTenantScope)}</p>
            </div>
            <Chip
              label={`${visibleAccounts.length} visible`}
              size="small"
              variant="outlined"
            />
          </div>

          {isSupergod && (
            <label className={s.fieldLabel}>
              Tenant view
              <select
                className={s.select}
                value={tenantScope}
                onChange={event => {
                  setTenantScope(event.target.value)
                }}
              >
                <option value="all">All tenants</option>
                {availableTenants.map(tenant => (
                  <option key={tenant} value={tenant}>
                    {tenant}
                  </option>
                ))}
              </select>
            </label>
          )}

          {notice !== null && (
            <Alert
              severity={
                notice.kind === 'error'
                  ? 'error'
                  : notice.kind === 'success'
                    ? 'success'
                    : 'info'
              }
            >
              {notice.message}
            </Alert>
          )}

          <div className={s.credentialList}>
            {loading ? (
              <div className={s.empty}>Loading accounts...</div>
            ) : visibleAccounts.length === 0 ? (
              <div className={s.empty}>No accounts found for this scope.</div>
            ) : (
              visibleAccounts.map(account => {
                const accountTenant = normalizeTenant(account.tenantId)
                const targetLevel = getRoleLevel(account.role ?? 'user')
                const isSelf = account.username === user?.username
                const aboveRole = !isSupergod && targetLevel > userLevel
                const canManage =
                  (isSupergod || accountTenant === ownTenant) && !aboveRole

                return (
                  <article
                    key={`${accountTenant}:${account.username ?? ''}`}
                    className={s.credentialRow}
                  >
                    <div className={s.credentialIcon}>
                      <span className="material-symbols-rounded">key</span>
                    </div>
                    <div className={s.credentialMain}>
                      <strong>{account.username}</strong>
                      <span>
                        {accountTenant}
                        {account.role != null ? ` \u00b7 ${account.role}` : ''}
                      </span>
                    </div>
                    <div className={s.rowActions}>
                      {isSelf && (
                        <Chip
                          label="current login"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {aboveRole && (
                        <Chip
                          label="supergod protected"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!canManage || saving}
                        onClick={() => {
                          setUsername(account.username ?? '')
                          setCreateTenant(accountTenant)
                          setPassword('')
                        }}
                      >
                        Set password
                      </Button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        <aside className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <Typography variant="subtitle2">Set a password</Typography>
              <p>
                The password is hashed by DBAL with Argon2id and is never
                shown again. Setting one for an existing username replaces it.
              </p>
            </div>
          </div>

          <div className={s.form}>
            {isSupergod ? (
              <label className={s.fieldLabel}>
                Tenant
                <select
                  className={s.select}
                  value={createTenant}
                  onChange={event => {
                    setCreateTenant(event.target.value)
                  }}
                >
                  {availableTenants.map(tenant => (
                    <option key={tenant} value={tenant}>
                      {tenant}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className={s.tenantLock}>
                <span className="material-symbols-rounded">lock</span>
                Setting in <strong>{ownTenant}</strong>
              </div>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={event => {
                setUsername(event.target.value)
              }}
              fullWidth
              size="small"
              placeholder="service-user"
            />
            <TextField
              label="Temporary password"
              type="password"
              value={password}
              onChange={event => {
                setPassword(event.target.value)
              }}
              fullWidth
              size="small"
              placeholder="At least 8 characters"
            />
            <Button
              variant="contained"
              size="small"
              disabled={saving}
              onClick={() => {
                void handleCreate()
              }}
            >
              {saving ? 'Saving...' : 'Set password'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
