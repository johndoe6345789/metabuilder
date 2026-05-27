'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import type { AppDispatch } from '@/store'
import {
  syncToDBALBulk,
  syncFromDBALBulk,
} from '@/store/slices/dbalSlice'
import {
  configureAutoSync,
  getAutoSyncStatus,
} from '@/store/middleware/autoSyncMiddleware'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useSyncTab() {
  const dispatch =
    useAppDispatch() as any as AppDispatch &
      ((action: any) => Promise<any>)
  const {
    status,
    lastSyncedAt,
    dbalConnected,
    error,
  } = useAppSelector((s) => s.dbal)
  const [autoSyncEnabled, setAutoSyncEnabled] =
    useState(false)
  const [pushing, setPushing] = useState(false)
  const [pulling, setPulling] = useState(false)

  useEffect(() => {
    const syncStatus = getAutoSyncStatus()
    setAutoSyncEnabled(syncStatus.enabled)
  }, [])

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled)
    configureAutoSync({
      enabled,
      syncOnChange: enabled,
    })
  }

  const handlePush = async () => {
    setPushing(true)
    try {
      await (
        dispatch(
          syncToDBALBulk() as any
        ) as Promise<any>
      )
    } catch {
      // Error captured in Redux state
    } finally {
      setPushing(false)
    }
  }

  const handlePull = async () => {
    setPulling(true)
    try {
      await (
        dispatch(
          syncFromDBALBulk() as any
        ) as Promise<any>
      )
    } catch {
      // Error captured in Redux state
    } finally {
      setPulling(false)
    }
  }

  return {
    status,
    lastSyncedAt,
    dbalConnected,
    error,
    autoSyncEnabled,
    pushing,
    pulling,
    handleToggleAutoSync,
    handlePush,
    handlePull,
  }
}
