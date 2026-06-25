'use client'

import { useState, useCallback, useEffect } from 'react'
import type { HttpMethod, QueryHistoryEntry } from '../types'
import {
  loadHistory,
  saveHistory,
  addToHistory,
} from '../queryUtils'

interface UseQueryHistoryReturn {
  history: QueryHistoryEntry[]
  pushEntry: (entry: QueryHistoryEntry) => void
  clearHistory: () => void
  restoreFrom: (
    entry: QueryHistoryEntry,
    onCli: (cmd: string) => void,
    onGui: (
      method: HttpMethod,
      tenant: string,
      pkg: string,
      entity: string,
      entityId: string,
    ) => void,
  ) => void
}

export function useQueryHistory(): UseQueryHistoryReturn {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const pushEntry = useCallback(
    (entry: QueryHistoryEntry) => {
      setHistory(prev => addToHistory(entry, prev))
    },
    [],
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const restoreFrom = useCallback(
    (
      entry: QueryHistoryEntry,
      onCli: (cmd: string) => void,
      onGui: (
        method: HttpMethod,
        tenant: string,
        pkg: string,
        entity: string,
        entityId: string,
      ) => void,
    ) => {
      if (entry.cli) {
        onCli(entry.cli)
        return
      }
      const parts = entry.path
        .replace(/\?.*$/, '')
        .split('/')
        .filter(Boolean)
      onGui(
        entry.method,
        parts[0] ?? '',
        parts[1] ?? '',
        parts[2] ?? '',
        parts[3] ?? '',
      )
    },
    [],
  )

  return { history, pushEntry, clearHistory, restoreFrom }
}
