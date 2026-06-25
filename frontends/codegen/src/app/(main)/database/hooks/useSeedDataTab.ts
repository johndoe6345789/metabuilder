'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import type { AppDispatch } from '@/store'
import {
  seedDBALDatabase,
  clearSeedResult,
} from '@/store/slices/dbalSlice'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useSeedDataTab() {
  const dispatch =
    useAppDispatch() as any as AppDispatch &
      ((action: any) => Promise<any>)
  const { seedResult, dbalConnected } = useAppSelector(
    (s) => s.dbal
  )
  const [force, setForce] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    setLoading(true)
    dispatch(clearSeedResult())
    try {
      await (
        dispatch(
          seedDBALDatabase({ force }) as any
        ) as Promise<any>
      )
    } catch {
      // Error is captured in Redux state
    } finally {
      setLoading(false)
    }
  }

  return {
    force,
    setForce,
    loading,
    dbalConnected,
    seedResult,
    handleSeed,
  }
}
