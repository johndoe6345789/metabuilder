'use client'

import { useEffect, useState } from 'react'
import { readDbalStatus, type DbalStatus } from './dbal-status'

/**
 * Starts at 'checking', not at offline: the original shape began as
 * `connected: false`, so a healthy daemon flashed red on every load.
 */
export function useDbalStatus(): DbalStatus {
  const [status, setStatus] = useState<DbalStatus>({ state: 'checking' })

  useEffect(() => {
    let live = true
    void readDbalStatus().then(next => {
      if (live) setStatus(next)
    })
    return () => {
      live = false
    }
  }, [])

  return status
}
