import { useEffect, useState } from 'react'

export type DbalState = 'checking' | 'online' | 'offline'

/** Pings DBAL's health endpoint once on mount; `initial` is the last
 *  known status (e.g. from a server-rendered prop) shown while that
 *  check is in flight. */
export function useDbalStatus(initial: boolean): DbalState {
  const [checking, setChecking] = useState(true)
  const [online, setOnline] = useState(initial)

  useEffect(() => {
    const dbalUrl =
      process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
    fetch(`${dbalUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => {
        setOnline(res.ok)
        setChecking(false)
      })
      .catch(() => {
        setOnline(false)
        setChecking(false)
      })
  }, [])

  if (checking) return 'checking'
  return online ? 'online' : 'offline'
}
