'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  createVaultEntry,
  deleteVaultEntry,
  loadVaultEntries,
  loadVaultSession,
  loginVaultMaster,
  logoutVaultMaster,
  updateVaultEntry,
} from './vault-api'
import { vaultView, type VaultTabId } from './vault-view'
import type { VaultDraft, VaultEntry } from './vault-types'

export type VaultNotice = { kind: 'success' | 'error' | 'info'; message: string }

function draftFromEntry(entry: VaultEntry | null): VaultDraft {
  return entry ?? {
    slug: '', title: '', username: '', password: '', group: 'General', notes: '',
    loginUrl: '/app/ui/login', appUrl: '/app',
  }
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-')
}

export function useVaultController() {
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
  const [notice, setNotice] = useState<VaultNotice | null>(null)
  const [editorTab, setEditorTab] = useState<VaultTabId>('identity')

  const showNotice = useCallback((kind: VaultNotice['kind'], message: string) => {
    setNotice({ kind, message })
  }, [])

  const refresh = useCallback(async () => {
    try {
      const nextEntries = await loadVaultEntries()
      setEntries(nextEntries)
      return nextEntries
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Vault unavailable')
      return []
    }
  }, [showNotice])

  useEffect(() => {
    let alive = true
    void loadVaultSession().then(isAuthed => {
      if (!alive) return
      setAuthenticated(isAuthed)
      if (!isAuthed) return
      void refresh()
    }).catch(() => { if (alive) setAuthenticated(false) })
      .finally(() => { if (alive) setAuthLoading(false) })
    return () => { alive = false }
  }, [refresh])

  const currentEntry = useMemo(() => {
    if (routeSlug === 'new') return null
    return entries.find(entry => entry.slug === routeSlug || entry.id === routeSlug)
      ?? (routeSlug === null ? entries[0] ?? null : null)
  }, [entries, routeSlug])

  useEffect(() => {
    setDraft(draftFromEntry(routeSlug === 'new' ? null : currentEntry))
  }, [currentEntry, routeSlug])

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (term.length === 0) return entries
    return entries.filter(entry => Object.values(entry).join(' ').toLowerCase().includes(term))
  }, [entries, search])

  const activeFields = useMemo(() => {
    const tab = vaultView.tabs.find(candidate => candidate.id === editorTab)
      ?? vaultView.tabs[0]
    return tab.fields.map(field => ({
      ...field,
      value: draft[field.key],
      inputType: field.type === 'textarea' ? 'text' : field.type,
      multiline: field.type === 'textarea',
    }))
  }, [draft, editorTab])

  const renderEditorActions = useMemo(() => vaultView.editorActions.map(action => ({
    ...action,
    disabled: saving || (
      action.requires?.some(key => (draft[key] ?? '').length === 0) ?? false
    ) || (action.requiresEntry === true && currentEntry === null),
  })), [currentEntry, draft, saving])

  const updatedLabel = currentEntry === null
    ? '' : `Updated ${new Date(currentEntry.updatedAt).toLocaleString()}`

  const selectEntry = (entry: VaultEntry) => {
    setEditorTab('identity')
    router.push(`/vault/${encodeURIComponent(entry.slug)}`)
  }

  const newEntry = () => {
    setEditorTab('identity')
    router.push('/vault/new')
  }

  const reload = async () => {
    const next = await refresh()
    router.push(next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new')
    showNotice('info', 'Vault reloaded from DBAL.')
  }

  const unlock = async () => {
    if (masterPassword.trim().length === 0) return
    try {
      setSaving(true)
      if (!await loginVaultMaster(masterPassword.trim())) {
        showNotice('error', 'Invalid master password.')
        return
      }
      setAuthenticated(true)
      setMasterPassword('')
      const next = await refresh()
      router.push(next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new')
      showNotice('success', 'Vault unlocked.')
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Unlock failed')
    } finally { setSaving(false) }
  }

  const lock = async () => {
    await logoutVaultMaster()
    setAuthenticated(false)
    setEntries([])
    setDraft(draftFromEntry(null))
    setSearch('')
    router.push('/vault')
  }

  const save = async () => {
    const slug = normalizeSlug(draft.slug || draft.title || draft.username || 'entry')
    if ([slug, draft.title.trim(), draft.username.trim(), draft.password.trim()].some(value => value.length === 0)) {
      showNotice('error', 'Slug, title, username, and password are required.')
      return
    }
    const payload = { ...draft, slug, title: draft.title.trim(), username: draft.username.trim(), group: draft.group.trim() || 'General', notes: draft.notes.trim(), loginUrl: draft.loginUrl.trim(), appUrl: draft.appUrl.trim() }
    try {
      setSaving(true)
      const saved = currentEntry === null
        ? await createVaultEntry(payload)
        : await updateVaultEntry(currentEntry.id, payload)
      await refresh()
      router.push(`/vault/${encodeURIComponent(saved.slug)}`)
      setDraft(draftFromEntry(saved))
      showNotice('success', `Saved ${saved.title}.`)
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if (currentEntry === null) return
    try {
      setSaving(true)
      await deleteVaultEntry(currentEntry.id)
      const next = await refresh()
      router.push(next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new')
      showNotice('info', `Deleted ${currentEntry.title}.`)
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Delete failed')
    } finally { setSaving(false) }
  }

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showNotice('success', `${label} copied.`)
    } catch {
      showNotice('error', `Unable to copy ${label.toLowerCase()}.`)
    }
  }

  const events = {
    reload,
    lock,
    new: newEntry,
    save,
    delete: remove,
    selectEntry,
    setSearch,
    setMasterPassword,
    unlock,
    setEditorTab,
    updateDraft: (key: keyof VaultDraft, value: string) => {
      setDraft(current => ({ ...current, [key]: value }))
    },
    copyUsername: () => copy(draft.username, 'Username'),
    copyPassword: () => copy(draft.password, 'Password'),
    copyTurbologin: () => copy(JSON.stringify({
      user: draft.username,
      pass: draft.password,
      rememberMe: true,
      loginMethod: 'password',
    }), 'Turbologin'),
  }

  return {
    entries, visibleEntries, currentEntry, draft, setDraft, authLoading,
    authenticated, saving, masterPassword, setMasterPassword, search, setSearch,
    notice, editorTab, setEditorTab, routeSlug, showNotice, selectEntry, newEntry,
    reload, unlock, lock, save, remove, events, activeFields,
    renderEditorActions, updatedLabel,
  }
}
