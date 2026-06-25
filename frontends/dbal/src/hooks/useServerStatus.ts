'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ServerHealth, StatusResponse } from '../status'

interface UseServerStatusReturn {
  health: ServerHealth[]
  lastUpdated: string
  error: string | null
  loading: boolean
  summary: string
}

export function useServerStatus(): UseServerStatusReturn {
  const [health, setHealth] = useState<ServerHealth[]>([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchStatus = async () => {
      try {
        const base =
          process.env.__NEXT_ROUTER_BASEPATH || '/dbal'
        const res = await fetch(`${base}/api/status`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Status endpoint failed')
        const data: StatusResponse = await res.json()
        if (cancelled) return
        setHealth(data.statuses)
        setLastUpdated(data.updatedAt)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Unable to load status',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchStatus()
    const id = setInterval(fetchStatus, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const summary = useMemo(() => {
    if (error) return 'Status unavailable right now'
    if (!health.length) return 'Initializing status feed...'
    return health.some(item => item.status !== 'online')
      ? 'Some systems need attention'
      : 'All systems nominal'
  }, [health, error])

  return { health, lastUpdated, error, loading, summary }
}
