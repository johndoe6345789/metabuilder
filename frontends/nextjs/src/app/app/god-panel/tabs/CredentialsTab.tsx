'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Chip, TextField, Typography } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { getRoleLevel } from '@/lib/constants'
import s from './CredentialsTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

type CredentialRecord = {
  username: string
  tenantId?: string | null
  salt?: string
}

type TenantRecord = {
  id: string
  name?: string
  slug?: string
}

type UserRecord = {
  username?: string
  role?: string
  tenantId?: string | null
}

type Notice = {
  kind: 'success' | 'error' | 'info'
  message: string
}

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (obj.data !== null && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>
      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }
  return []
}

function tenantLabel(tenantId: string): string {
  return tenantId === 'all' ? 'All tenants' : tenantId
}

function normalizeTenant(value: string | null | undefined): string {
  return value != null && value.trim().length > 0 ? value.trim() : 'system'
}

async function sha512(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const buffer = await crypto.subtle.digest('SHA-512', encoded)
  return [...new Uint8Array(buffer)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

function randomSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function CredentialsTab() {
  const auth = useAuthContext()
  const user = auth.user
  const userRole = user?.role ?? 'public'
  const userLevel = getRoleLevel(userRole)
  const isSupergod = userLevel >= 5
  const ownTenant = normalizeTenant(user?.tenantId)

  const [credentials, setCredentials] = useState<CredentialRecord[]>([])
  const [tenants, setTenants] = useState<TenantRecord[]>([])
  const [usersByUsername, setUsersByUsername] = useState<Record<string, UserRecord>>({})
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

  const visibleCredentials = useMemo(() => (
    credentials.filter(credential => (
      effectiveTenantScope === 'all'
        ? true
        : normalizeTenant(credential.tenantId) === effectiveTenantScope
    ))
  ), [credentials, effectiveTenantScope])

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
        const credentialUrl = `${DBAL_URL}/system/access/Credential${params.size > 0 ? `?${params.toString()}` : ''}`
        const userParams = new URLSearchParams()
        if (effectiveTenantScope !== 'all') {
          userParams.set('filter.tenantId', effectiveTenantScope)
        }
        const userUrl = `${DBAL_URL}/system/core/User${userParams.size > 0 ? `?${userParams.toString()}` : ''}`

        const [credentialRes, userRes, tenantRes] = await Promise.all([
          fetch(credentialUrl, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
          fetch(userUrl, { cache: 'no-store', signal: AbortSignal.timeout(8000) }).catch(() => null),
          isSupergod
            ? fetch(`${DBAL_URL}/system/core/Tenant`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }).catch(() => null)
            : Promise.resolve(null),
        ])

        if (!credentialRes.ok) {
          throw new Error(`Credential list failed with ${String(credentialRes.status)}`)
        }

        const credentialRaw = await credentialRes.json() as unknown
        const userRaw = userRes?.ok === true ? await userRes.json() as unknown : null
        const tenantRaw = tenantRes?.ok === true ? await tenantRes.json() as unknown : null
        const loadedUsers = unwrapList<UserRecord>(userRaw)

        if (!cancelled) {
          setCredentials(unwrapList<CredentialRecord>(credentialRaw))
          setUsersByUsername(Object.fromEntries(
            loadedUsers
              .filter(loadedUser => loadedUser.username != null && loadedUser.username.length > 0)
              .map(loadedUser => [loadedUser.username as string, loadedUser])
          ))
          setTenants(unwrapList<TenantRecord>(tenantRaw))
        }
      } catch {
        if (!cancelled) {
          setCredentials([])
          setNotice({
            kind: 'error',
            message: 'Credential records could not be loaded. Check DBAL access for system/access/Credential.',
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

  const refreshCredentials = async () => {
    const params = new URLSearchParams()
    if (effectiveTenantScope !== 'all') {
      params.set('filter.tenantId', effectiveTenantScope)
    }
    const url = `${DBAL_URL}/system/access/Credential${params.size > 0 ? `?${params.toString()}` : ''}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Credential reload failed')
    const raw = await res.json() as unknown
    setCredentials(unwrapList<CredentialRecord>(raw))
  }

  const handleCreate = async () => {
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()
    const targetTenant = isSupergod ? normalizeTenant(createTenant) : ownTenant

    if (cleanUsername.length < 3 || cleanPassword.length < 8) {
      setNotice({ kind: 'error', message: 'Use a username of 3+ characters and a password of 8+ characters.' })
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      const salt = randomSalt()
      const passwordHash = await sha512(cleanPassword)
      const res = await fetch(`${DBAL_URL}/system/access/Credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          passwordHash,
          salt,
          tenantId: targetTenant,
          createdBy: user?.id ?? user?.username ?? 'unknown',
          createdAt: Date.now(),
        }),
      })

      if (!res.ok) throw new Error(await res.text().catch(() => 'Create failed'))

      setUsername('')
      setPassword('')
      setNotice({ kind: 'success', message: `${cleanUsername} credential created for ${targetTenant}.` })
      await refreshCredentials()
    } catch {
      setNotice({ kind: 'error', message: 'Credential could not be created. It may already exist or DBAL rejected the request.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (credential: CredentialRecord) => {
    const credentialTenant = normalizeTenant(credential.tenantId)
    if (!isSupergod && credentialTenant !== ownTenant) {
      setNotice({ kind: 'error', message: 'God users can only delete credentials inside their own tenant.' })
      return
    }
    if (credential.username === user?.username) {
      setNotice({ kind: 'error', message: 'You cannot delete the credential for the account you are currently using.' })
      return
    }
    const targetUser = usersByUsername[credential.username]
    const targetLevel = getRoleLevel(targetUser?.role ?? 'user')
    if (!isSupergod && targetLevel > userLevel) {
      setNotice({ kind: 'error', message: 'God users cannot delete credentials for supergod accounts.' })
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      const res = await fetch(`${DBAL_URL}/system/access/Credential/${encodeURIComponent(credential.username)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Delete failed')
      setNotice({ kind: 'success', message: `${credential.username} credential deleted.` })
      await refreshCredentials()
    } catch {
      setNotice({ kind: 'error', message: 'Credential could not be deleted. DBAL may not allow this operation yet.' })
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
              <Typography variant="subtitle2">Credential scope</Typography>
              <p>Current view: {tenantLabel(effectiveTenantScope)}</p>
            </div>
            <Chip label={`${visibleCredentials.length} visible`} size="small" variant="outlined" />
          </div>

          {isSupergod && (
            <label className={s.fieldLabel}>
              Tenant view
              <select
                className={s.select}
                value={tenantScope}
                onChange={event => { setTenantScope(event.target.value) }}
              >
                <option value="all">All tenants</option>
                {availableTenants.map(tenant => (
                  <option key={tenant} value={tenant}>{tenant}</option>
                ))}
              </select>
            </label>
          )}

          {notice !== null && (
            <Alert severity={notice.kind === 'error' ? 'error' : notice.kind === 'success' ? 'success' : 'info'}>
              {notice.message}
            </Alert>
          )}

          <div className={s.credentialList}>
            {loading ? (
              <div className={s.empty}>Loading credentials...</div>
            ) : visibleCredentials.length === 0 ? (
              <div className={s.empty}>No credentials found for this scope.</div>
            ) : (
              visibleCredentials.map(credential => {
                const credentialTenant = normalizeTenant(credential.tenantId)
                const targetUser = usersByUsername[credential.username]
                const targetLevel = getRoleLevel(targetUser?.role ?? 'user')
                const locked = credential.username === user?.username
                const aboveRole = !isSupergod && targetLevel > userLevel
                const canDelete = isSupergod || credentialTenant === ownTenant

                return (
                  <article key={`${credentialTenant}:${credential.username}`} className={s.credentialRow}>
                    <div className={s.credentialIcon}>
                      <span className="material-symbols-rounded">key</span>
                    </div>
                    <div className={s.credentialMain}>
                      <strong>{credential.username}</strong>
                      <span>
                        {credentialTenant}
                        {targetUser?.role != null ? ` · ${targetUser.role}` : ''}
                      </span>
                    </div>
                    <div className={s.rowActions}>
                      {locked && <Chip label="current login" size="small" variant="outlined" />}
                      {aboveRole && <Chip label="supergod protected" size="small" variant="outlined" />}
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!canDelete || locked || aboveRole || saving}
                        onClick={() => { void handleDelete(credential) }}
                      >
                        Delete
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
              <Typography variant="subtitle2">Create credential</Typography>
              <p>Hashes are stored; passwords are never displayed after creation.</p>
            </div>
          </div>

          <div className={s.form}>
            {isSupergod ? (
              <label className={s.fieldLabel}>
                Tenant
                <select
                  className={s.select}
                  value={createTenant}
                  onChange={event => { setCreateTenant(event.target.value) }}
                >
                  {availableTenants.map(tenant => (
                    <option key={tenant} value={tenant}>{tenant}</option>
                  ))}
                </select>
              </label>
            ) : (
              <div className={s.tenantLock}>
                <span className="material-symbols-rounded">lock</span>
                Creating in <strong>{ownTenant}</strong>
              </div>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={event => { setUsername(event.target.value) }}
              fullWidth
              size="small"
              placeholder="service-user"
            />
            <TextField
              label="Temporary password"
              type="password"
              value={password}
              onChange={event => { setPassword(event.target.value) }}
              fullWidth
              size="small"
              placeholder="At least 8 characters"
            />
            <Button
              variant="contained"
              size="small"
              disabled={saving}
              onClick={() => { void handleCreate() }}
            >
              {saving ? 'Saving...' : 'Create credential'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
