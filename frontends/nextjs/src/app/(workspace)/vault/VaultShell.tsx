'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Alert, Button, Chip, Paper, TextField, Typography } from '@/m3'
import {
  createVaultEntry,
  deleteVaultEntry,
  loadVaultEntries,
  loadVaultSession,
  loginVaultMaster,
  logoutVaultMaster,
  updateVaultEntry,
} from './vault-api'
import type { VaultDraft, VaultEntry } from './vault-types'
import s from './page.module.scss'

type Notice = {
  kind: 'success' | 'error' | 'info'
  message: string
}

function copyText(text: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (copied) {
      resolve()
      return
    }
    reject(new Error('Clipboard copy failed'))
  })
}

function turboPayload(entry: VaultEntry): string {
  return JSON.stringify({
    user: entry.username,
    pass: entry.password,
    rememberMe: true,
    loginMethod: 'password',
  })
}

function draftFromEntry(entry: VaultEntry | null): VaultDraft {
  return entry !== null
    ? {
        slug: entry.slug,
        title: entry.title,
        username: entry.username,
        password: entry.password,
        group: entry.group,
        notes: entry.notes,
        loginUrl: entry.loginUrl,
        appUrl: entry.appUrl,
      }
    : {
        slug: '',
        title: '',
        username: '',
        password: '',
        group: 'General',
        notes: '',
        loginUrl: '/app/ui/login',
        appUrl: '/app',
      }
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function VaultShell() {
  const router = useRouter()
  const params = useParams<{ slug?: string[] }>()
  const routeSlug = params.slug?.[0] ?? null
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [draft, setDraft] = useState<VaultDraft>(draftFromEntry(null))
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)

  const refresh = useCallback(async () => {
    try {
      const nextEntries = await loadVaultEntries()
      setEntries(nextEntries)
      return nextEntries
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Vault unavailable')
      return []
    }
  }, [])

  useEffect(() => {
    let alive = true
    void loadVaultSession()
      .then(isAuthed => {
        if (!alive) return
        setAuthenticated(isAuthed)
        if (!isAuthed) {
          setEntries([])
          setDraft(draftFromEntry(null))
          return
        }
        void refresh().then(nextEntries => {
          if (!alive) return
          const selected =
            routeSlug === 'new'
              ? null
              : nextEntries.find(
                  entry => entry.slug === routeSlug || entry.id === routeSlug
                ) ?? nextEntries[0] ?? null
          setDraft(draftFromEntry(selected))
        })
      })
      .catch(() => {
        if (!alive) return
        setAuthenticated(false)
      })
      .finally(() => {
        if (!alive) return
        setAuthLoading(false)
      })

    return () => {
      alive = false
    }
  }, [refresh, routeSlug])

  useEffect(() => {
    if (routeSlug === 'new') {
      setDraft(draftFromEntry(null))
      return
    }
    const selected =
      entries.find(entry => entry.slug === routeSlug || entry.id === routeSlug) ??
      (routeSlug === null ? entries[0] ?? null : null)
    setDraft(draftFromEntry(selected))
  }, [entries, routeSlug])

  const currentEntry = useMemo(() => {
    if (routeSlug === 'new') return null
    return (
      entries.find(entry => entry.slug === routeSlug || entry.id === routeSlug) ??
      (routeSlug === null ? entries[0] ?? null : null)
    )
  }, [entries, routeSlug])

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (term.length === 0) return entries
    return entries.filter(entry =>
      [
        entry.title,
        entry.slug,
        entry.username,
        entry.group,
        entry.notes,
        entry.loginUrl,
        entry.appUrl,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [entries, search])

  const showNotice = (kind: Notice['kind'], message: string) => {
    setNotice({ kind, message })
  }

  const handleSelect = (entry: VaultEntry) => {
    router.push(`/vault/${encodeURIComponent(entry.slug)}`)
  }

  const handleNew = () => {
    router.push('/vault/new')
  }

  const handleReset = async () => {
    const nextEntries = await refresh()
    router.push(nextEntries[0] !== undefined ? `/vault/${nextEntries[0].slug}` : '/vault/new')
    showNotice('info', 'Vault reloaded from DBAL.')
  }

  const handleUnlock = async () => {
    if (masterPassword.trim().length === 0) return
    try {
      setSaving(true)
      const ok = await loginVaultMaster(masterPassword.trim())
      if (!ok) {
        showNotice('error', 'Invalid master password.')
        return
      }
      setAuthenticated(true)
      setMasterPassword('')
      const nextEntries = await refresh()
      router.push(nextEntries[0] !== undefined ? `/vault/${nextEntries[0].slug}` : '/vault/new')
      showNotice('success', 'Vault unlocked.')
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Unlock failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLock = async () => {
    await logoutVaultMaster()
    setAuthenticated(false)
    setEntries([])
    setDraft(draftFromEntry(null))
    setSearch('')
    router.push('/vault')
  }

  const handleSave = async () => {
    const slug = normalizeSlug(
      draft.slug || draft.title || draft.username || 'entry'
    )
    if (
      slug.length === 0 ||
      draft.title.trim().length === 0 ||
      draft.username.trim().length === 0 ||
      draft.password.trim().length === 0
    ) {
      showNotice('error', 'Slug, title, username, and password are required.')
      return
    }

    const payload: VaultDraft = {
      ...draft,
      slug,
      title: draft.title.trim(),
      username: draft.username.trim(),
      password: draft.password,
      group: draft.group.trim() || 'General',
      notes: draft.notes.trim(),
      loginUrl: draft.loginUrl.trim(),
      appUrl: draft.appUrl.trim(),
    }

    try {
      setSaving(true)
      const nextEntry =
        currentEntry !== null
          ? await updateVaultEntry(currentEntry.id, payload)
          : await createVaultEntry(payload)
      await refresh()
      router.push(`/vault/${encodeURIComponent(nextEntry.slug)}`)
      setDraft(draftFromEntry(nextEntry))
      showNotice('success', `Saved ${nextEntry.title}.`)
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (currentEntry === null) return
    try {
      setSaving(true)
      await deleteVaultEntry(currentEntry.id)
      const nextEntries = await refresh()
      router.push(nextEntries[0] !== undefined ? `/vault/${nextEntries[0].slug}` : '/vault/new')
      setDraft(draftFromEntry(nextEntries[0] ?? null))
      showNotice('info', `Deleted ${currentEntry.title}.`)
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className={s.page}>
        <Typography variant="body2" color="text.secondary">
          Loading vault...
        </Typography>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className={s.page}>
        <Paper className={s.editorPanel}>
          <Typography variant="h5" gutterBottom>
            Vault
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter the master password to open the DBAL-backed login store.
          </Typography>
          {notice !== null && (
            <Alert
              severity={notice.kind === 'error' ? 'error' : 'info'}
              className={s.alert}
            >
              {notice.message}
            </Alert>
          )}
          <TextField
            label="Master password"
            type="password"
            value={masterPassword}
            onChange={event => {
              setMasterPassword(event.target.value)
            }}
            fullWidth
          />
          <div className={s.detailActions}>
            <Button
              variant="contained"
              onClick={() => { void handleUnlock() }}
              disabled={saving}
            >
              Unlock Vault
            </Button>
          </div>
        </Paper>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div>
          <Typography variant="h5">Vault</Typography>
          <Typography variant="body2" color="text.secondary">
            {entries.length} test credentials stored in DBAL
          </Typography>
        </div>
        <div className={s.headerActions}>
          <Button variant="outlined" onClick={() => { void handleReset() }}>
            Reload
          </Button>
          <Button variant="outlined" onClick={() => { void handleLock() }}>
            Lock
          </Button>
          <Button variant="contained" onClick={handleNew}>
            New Entry
          </Button>
        </div>
      </header>

      {notice !== null && (
        <Alert
          severity={
            notice.kind === 'error'
              ? 'error'
              : notice.kind === 'success'
                ? 'success'
                : 'info'
          }
          className={s.alert}
        >
          {notice.message}
        </Alert>
      )}

      <div className={s.splitLayout}>
        <Paper className={s.listPanel}>
          <div className={s.listHead}>
            <TextField
              label="Search"
              value={search}
              onChange={event => {
                setSearch(event.target.value)
              }}
              fullWidth
            />
            <Chip
              label={`${visibleEntries.length} shown`}
              size="small"
              variant="outlined"
            />
          </div>

          <div className={s.cardList}>
            {visibleEntries.map(entry => {
              const active = currentEntry?.id === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`${s.card} ${active ? s.cardActive : ''}`}
                  onClick={() => {
                    handleSelect(entry)
                  }}
                >
                  <div className={s.cardTop}>
                    <strong>{entry.title}</strong>
                    <Chip label={entry.group} size="small" variant="outlined" />
                  </div>
                  <div className={s.cardBody}>
                    <span>{entry.username}</span>
                    <span>{entry.slug}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Paper>

        <Paper className={s.editorPanel}>
          <div className={s.editorHead}>
            <div>
              <Typography variant="h6">
                {routeSlug === 'new' || currentEntry === null
                  ? 'New entry'
                  : currentEntry.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {routeSlug === 'new' || currentEntry === null
                  ? 'Create or edit a test login.'
                  : currentEntry.slug}
              </Typography>
            </div>
            {currentEntry !== null && (
              <Chip
                label={`Updated ${new Date(currentEntry.updatedAt).toLocaleString()}`}
                size="small"
              />
            )}
          </div>

          <div className={s.formGrid}>
            <TextField
              label="Title"
              value={draft.title}
              onChange={event => {
                setDraft(current => ({ ...current, title: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Slug"
              value={draft.slug}
              onChange={event => {
                setDraft(current => ({ ...current, slug: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Username"
              value={draft.username}
              onChange={event => {
                setDraft(current => ({ ...current, username: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={draft.password}
              onChange={event => {
                setDraft(current => ({ ...current, password: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Group"
              value={draft.group}
              onChange={event => {
                setDraft(current => ({ ...current, group: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Login URL"
              value={draft.loginUrl}
              onChange={event => {
                setDraft(current => ({ ...current, loginUrl: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="App URL"
              value={draft.appUrl}
              onChange={event => {
                setDraft(current => ({ ...current, appUrl: event.target.value }))
              }}
              fullWidth
            />
            <TextField
              label="Notes"
              value={draft.notes}
              onChange={event => {
                setDraft(current => ({ ...current, notes: event.target.value }))
              }}
              fullWidth
              multiline
              rows={3}
            />
          </div>

          <div className={s.detailActions}>
            <Button
              variant="outlined"
              onClick={() => {
                void copyText(draft.username).then(() => {
                  showNotice('success', 'Username copied.')
                })
              }}
              disabled={draft.username.length === 0}
            >
              Copy Username
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                void copyText(draft.password).then(() => {
                  showNotice('success', 'Password copied.')
                })
              }}
              disabled={draft.password.length === 0}
            >
              Copy Password
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                void copyText(
                  turboPayload({
                    id: currentEntry?.id ?? 'preview',
                    slug: draft.slug,
                    title: draft.title,
                    username: draft.username,
                    password: draft.password,
                    group: draft.group,
                    notes: draft.notes,
                    loginUrl: draft.loginUrl,
                    appUrl: draft.appUrl,
                    tenantId: 'system',
                    createdAt: currentEntry?.createdAt ?? Date.now(),
                    updatedAt: currentEntry?.updatedAt ?? Date.now(),
                  })
                ).then(() => {
                  showNotice('success', 'Turbologin copied.')
                })
              }}
              disabled={draft.username.length === 0 || draft.password.length === 0}
            >
              Copy Turbologin
            </Button>
            <Button variant="outlined" onClick={() => { void handleSave() }} disabled={saving}>
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => { void handleDelete() }}
              disabled={currentEntry === null || saving}
            >
              Delete
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  )
}
