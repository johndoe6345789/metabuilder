import { useEffect, useState } from 'react'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export type DbalStatus = 'checking' | 'online' | 'offline'

/** Pings DBAL's /health endpoint on mount and on demand, so the tab can
 *  show a live status chip instead of assuming the daemon is reachable. */
export function useDbalHealth() {
  const [status, setStatus] = useState<DbalStatus>('checking')
  const [message, setMessage] = useState<string | null>(null)

  const checkHealth = () => {
    fetch(`${DBAL_URL}/health`, { signal: AbortSignal.timeout(5000) })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setStatus('online')
        setMessage(null)
      })
      .catch((e: unknown) => {
        setStatus('offline')
        setMessage(e instanceof Error ? e.message : 'DBAL health check failed')
      })
  }

  const refresh = () => {
    setStatus('checking')
    checkHealth()
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return { status, message, refresh }
}
