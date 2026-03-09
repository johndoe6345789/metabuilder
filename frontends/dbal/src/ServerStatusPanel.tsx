"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ServerHealth, StatusResponse } from './status'
import styles from './ServerStatusPanel.module.scss'

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
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.caption}>Server status</p>
        <h2 className={styles.heading}>Observability Feed</h2>
        <p className={styles.caption}>{summary}</p>
      </div>

      <div className={styles.grid}>
        {loading && health.length === 0 ? (
          <div className={styles.placeholder}>Loading status...</div>
        ) : error ? (
          <div className={styles.placeholder}>
            <p className={styles.errorText}>{error}</p>
            <p className={styles.caption}>Try refreshing the page in a few moments.</p>
          </div>
        ) : (
          health.map(item => (
            <article key={item.name} className={styles.card}>
              <div className={styles.cardRow}>
                <div className={styles.cardTitleGroup}>
                  <span className={`${styles.statusDot} ${styles[item.status]}`} />
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                </div>
                <span className={styles.statusLabel}>{item.status}</span>
              </div>
              <p className={styles.cardMessage}>{item.message}</p>
              <div className={styles.cardMeta}>
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
