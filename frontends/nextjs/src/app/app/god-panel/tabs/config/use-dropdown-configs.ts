'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'

const KEY = 'god.dropdownConfigs'

export interface DropdownOption { label: string; value: string }
export interface DropdownConfig { id: string; name: string; options: DropdownOption[] }

function seed(): DropdownConfig[] {
  return [{
    id: 'd_status', name: 'status', options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Archived', value: 'archived' },
    ],
  }]
}

/** Named dropdown option-sets reused across forms/components. */
export function useDropdownConfigs() {
  const [configs, setConfigs] = useState<DropdownConfig[]>(seed)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    void idbGet<DropdownConfig[]>(KEY).then((c) => { if (c && c.length) setConfigs(c) })
  }, [])

  const persist = useCallback((next: DropdownConfig[]) => {
    setConfigs(next); setDirty(true); void idbSet(KEY, next)
  }, [])

  const create = useCallback((name: string): string => {
    const id = `d_${Date.now()}`
    persist([...configs, { id, name: name.trim() || 'new-list', options: [] }])
    return id
  }, [configs, persist])

  const rename = useCallback((id: string, name: string) => {
    persist(configs.map((c) => c.id === id ? { ...c, name } : c))
  }, [configs, persist])

  const addOption = useCallback((id: string, opt: DropdownOption) => {
    persist(configs.map((c) => c.id === id
      ? { ...c, options: [...c.options, opt] } : c))
  }, [configs, persist])

  const removeOption = useCallback((id: string, index: number) => {
    persist(configs.map((c) => c.id === id
      ? { ...c, options: c.options.filter((_, i) => i !== index) } : c))
  }, [configs, persist])

  const remove = useCallback((id: string) => {
    persist(configs.filter((c) => c.id !== id))
  }, [configs, persist])

  return { configs, create, rename, addOption, removeOption, remove, dirty }
}
