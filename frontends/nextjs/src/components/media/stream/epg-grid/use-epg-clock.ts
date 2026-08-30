'use client'

import { useEffect, useMemo, useState } from 'react'
import { computeWindow } from './timeline-window'

const WINDOW_MINUTES = 150 // matches Sky's guide: a couple hours at a time

/** Ticks every 30s so the NOW line and "now airing" block track reality
 *  without needing a full data refetch. */
export function useEpgClock() {
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setClock(Date.now())
    }, 30000)
    return () => {
      clearInterval(id)
    }
  }, [])

  const window = useMemo(
    () => computeWindow(clock, WINDOW_MINUTES),
    [clock]
  )

  return { clock, ...window }
}
