'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import type { AppDispatch } from '@/store'
import {
  checkDBALConnection,
  fetchDBALAdapters,
} from '@/store/slices/dbalSlice'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useStatusTab() {
  const dispatch =
    useAppDispatch() as any as AppDispatch &
      ((action: any) => Promise<any>)
  const { dbalConnected, dbalConfig, dbalAdapters } =
    useAppSelector((s) => s.dbal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dispatch(checkDBALConnection() as any),
      dispatch(fetchDBALAdapters() as any),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  const refresh = () => {
    setLoading(true)
    ;(
      dispatch(
        checkDBALConnection() as any
      ) as Promise<any>
    ).finally(() => setLoading(false))
  }

  return {
    loading,
    dbalConnected,
    dbalConfig,
    dbalAdapters,
    refresh,
  }
}
