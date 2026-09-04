'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDropdowns, type GodState } from '@/store/slices/god-slice'

export interface DropdownOption {
  label: string
  value: string
}
export interface DropdownConfig {
  id: string
  name: string
  options: DropdownOption[]
}

/** Named dropdown option-sets (persisted in Redux god slice). */
export function useDropdownConfigs() {
  const dispatch = useAppDispatch()
  const configs = useAppSelector(s => (s.god as GodState).dropdowns)
  const persist = useCallback(
    (next: DropdownConfig[]) => {
      dispatch(setDropdowns(next))
    },
    [dispatch]
  )

  const create = useCallback(
    (name: string): string => {
      const id = `d_${Date.now()}`
      const trimmed = name.trim()
      persist([
        ...configs,
        { id, name: trimmed.length > 0 ? trimmed : 'new-list', options: [] },
      ])
      return id
    },
    [configs, persist]
  )

  const rename = useCallback(
    (id: string, name: string) => {
      persist(configs.map(c => (c.id === id ? { ...c, name } : c)))
    },
    [configs, persist]
  )

  const addOption = useCallback(
    (id: string, opt: DropdownOption) => {
      persist(
        configs.map(c =>
          c.id === id ? { ...c, options: [...c.options, opt] } : c
        )
      )
    },
    [configs, persist]
  )

  const removeOption = useCallback(
    (id: string, index: number) => {
      persist(
        configs.map(c =>
          c.id === id
            ? { ...c, options: c.options.filter((_, i) => i !== index) }
            : c
        )
      )
    },
    [configs, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(configs.filter(c => c.id !== id))
    },
    [configs, persist]
  )

  return { configs, create, rename, addOption, removeOption, remove }
}
