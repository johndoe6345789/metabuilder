'use client'

import { BASE_PATH } from '@/lib/app-config'
import type { VaultDraft, VaultEntry } from './vault-types'

const BASE_URL = `${BASE_PATH}/api/vault/logins`
const AUTH_URL = `${BASE_PATH}/api/vault/auth`

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T
  return data
}

export async function loadVaultEntries(): Promise<VaultEntry[]> {
  const res = await fetch(BASE_URL, { cache: 'no-store', credentials: 'include' })
  if (!res.ok) {
    const payload = await readJson<{ error?: string }>(res)
    throw new Error(payload.error ?? `Vault load failed with ${res.status}`)
  }
  const payload = await readJson<{ entries?: VaultEntry[] }>(res)
  return Array.isArray(payload.entries) ? payload.entries : []
}

export async function createVaultEntry(draft: VaultDraft): Promise<VaultEntry> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(draft),
  })
  if (!res.ok) {
    const payload = await readJson<{ error?: string }>(res)
    throw new Error(payload.error ?? `Vault create failed with ${res.status}`)
  }
  const payload = await readJson<{ entry?: VaultEntry }>(res)
  if (payload.entry === undefined) throw new Error('Vault create returned no entry')
  return payload.entry
}

export async function updateVaultEntry(
  id: string,
  draft: VaultDraft
): Promise<VaultEntry> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(draft),
  })
  if (!res.ok) {
    const payload = await readJson<{ error?: string }>(res)
    throw new Error(payload.error ?? `Vault update failed with ${res.status}`)
  }
  const payload = await readJson<{ entry?: VaultEntry }>(res)
  if (payload.entry === undefined) throw new Error('Vault update returned no entry')
  return payload.entry
}

export async function deleteVaultEntry(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const payload = await readJson<{ error?: string }>(res)
    throw new Error(payload.error ?? `Vault delete failed with ${res.status}`)
  }
}

export async function loadVaultSession(): Promise<boolean> {
  const res = await fetch(AUTH_URL, {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) return false
  const payload = (await res.json().catch(() => ({}))) as { authenticated?: boolean }
  return payload.authenticated === true
}

export async function loginVaultMaster(password: string): Promise<boolean> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? 'Vault login failed')
  }
  const payload = (await res.json().catch(() => ({}))) as { authenticated?: boolean }
  return payload.authenticated === true
}

export async function logoutVaultMaster(): Promise<void> {
  await fetch(AUTH_URL, {
    method: 'DELETE',
    credentials: 'include',
  })
}
