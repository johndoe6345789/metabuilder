/**
 * @file useKV.ts
 * @description Custom useKV hook - replacement for @github/spark/hooks
 * Uses in-memory storage with localStorage persistence in the browser
 * API compatible with @github/spark/hooks
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import type { JsonValue } from '@/types/utility-types'

import { notifySubscribers, subscribe } from './kv-utils/kv-store'
import { deleteStoredValue, readStoredValue, writeStoredValue } from './kv-utils/storage-operations'

let storageListenerRegistered = false

function registerStorageListener(): void {
  if (storageListenerRegistered || typeof window === 'undefined') return
  storageListenerRegistered = true

  window.addEventListener('storage', e => {
    if (!e.key || !e.key.startsWith('mb_kv:')) return

    const cleanKey = e.key.replace(/^mb_kv:/, '')
    const newValue = e.newValue ? JSON.parse(e.newValue) : undefined
    notifySubscribers(cleanKey, newValue)
  })
}

export function useKV<T = JsonValue>(
  key: string,
  defaultValue?: T
): [T | undefined, (newValueOrUpdater: T | ((prev: T | undefined) => T)) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(() => {
    const stored = readStoredValue<T>(key)
    return stored !== undefined ? stored : defaultValue
  })

  const isFirstMount = useRef(true)

  useEffect(() => {
    registerStorageListener()
  }, [])

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const stored = readStoredValue<T>(key)
    if (stored !== undefined) {
      setValue(stored)
    } else if (defaultValue !== undefined) {
      setValue(defaultValue)
    }
  }, [key, defaultValue])

  useEffect(() => {
    return subscribe(key, newValue => {
      setValue(newValue as T | undefined)
    })
  }, [key])

  const setKV = useCallback(
    async (newValueOrUpdater: T | ((prev: T | undefined) => T)) => {
      const newValue =
        typeof newValueOrUpdater === 'function'
          ? (newValueOrUpdater as (prev: T | undefined) => T)(value)
          : newValueOrUpdater

      setValue(newValue)
      writeStoredValue(key, newValue)
      notifySubscribers(key, newValue)
    },
    [key, value]
  )

  return [value, setKV]
}

export function deleteKV(key: string): void {
  deleteStoredValue(key)
  notifySubscribers(key, undefined)
}
