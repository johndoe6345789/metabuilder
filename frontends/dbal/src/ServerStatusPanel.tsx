"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ServerHealth, StatusResponse } from './status'

const statusPalette: Record<ServerHealth['status'], string> = {
  online: 'bg-emerald-500/90',
  degraded: 'bg-amber-500/80',
  offline: 'bg-rose-500/80',
}

export function ServerStatusPanel() {
  const [health, setHealth] = useState<ServerHealth[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Status endpoint failed')
        }

        const data: StatusResponse = await response.json()
        if (cancelled) return

        setHealth(data.statuses)
        setLastUpdated(data.updatedAt)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unable to load status')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchStatus()

    const refreshInterval = setInterval(fetchStatus, 30_000)
    return () => {
      cancelled = true
      clearInterval(refreshInterval)
    }
  }, [])

  const summary = useMemo(() => {
    if (error) {
      return 'Status unavailable right now'
    }

    if (health.length === 0) {
      return 'Initializing status feed...'
    }

    const degraded = health.some(item => item.status !== 'online')
    return degraded ? 'Some systems need attention' : 'All systems nominal'
  }, [health, error])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Server status</p>
        <h2 className="text-2xl font-bold">Observability Feed</h2>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading && health.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-card/50 p-6 shadow">Loading status...</div>
        ) : error ? (
          <div className="col-span-full rounded-2xl bg-card/50 p-6 shadow">
            <p className="text-sm text-rose-500">{error}</p>
            <p className="text-sm text-muted-foreground">Try refreshing the page in a few moments.</p>
          </div>
        ) : (
          health.map(item => (
            <article
              key={item.name}
              className="rounded-2xl border border-border/40 bg-card/80 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${statusPalette[item.status]}`} />
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.message}</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.latencyMs != null ? `${item.latencyMs.toFixed(0)} ms` : 'Latency unknown'}</span>
                <span>Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
