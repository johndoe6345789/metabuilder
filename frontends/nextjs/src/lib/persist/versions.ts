'use client'

import { idbGet, idbSet } from './idb-kv'

/**
 * Homegrown version control for the declarative data. Everything is JSON, so a
 * snapshot is just a stored copy. Each publish pushes a version; history can be
 * viewed and reverted. Snapshots live under `${key}.versions` in IndexedDB.
 */

export interface Snapshot<T = unknown> {
  id: string
  label: string
  at: number
  data: T
}

const MAX_VERSIONS = 50

function vkey(key: string): string {
  return `${key}.versions`
}

export async function snapshot<T>(
  key: string,
  data: T,
  label = 'Publish'
): Promise<Snapshot<T>> {
  const list = (await idbGet<Snapshot<T>[]>(vkey(key))) ?? []
  const snap: Snapshot<T> = {
    id: `v_${Date.now()}`,
    label,
    at: Date.now(),
    // structuredClone keeps the snapshot immutable to later edits.
    data:
      typeof structuredClone === 'function'
        ? structuredClone(data)
        : (JSON.parse(JSON.stringify(data)) as T),
  }
  const next = [snap, ...list].slice(0, MAX_VERSIONS)
  await idbSet(vkey(key), next)
  return snap
}

export async function listVersions<T>(key: string): Promise<Snapshot<T>[]> {
  return (await idbGet<Snapshot<T>[]>(vkey(key))) ?? []
}

export async function getVersion<T>(
  key: string,
  id: string
): Promise<T | null> {
  const list = (await idbGet<Snapshot<T>[]>(vkey(key))) ?? []
  return list.find(v => v.id === id)?.data ?? null
}
