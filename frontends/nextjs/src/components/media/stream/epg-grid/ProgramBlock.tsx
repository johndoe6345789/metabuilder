'use client'

import type { EpgEntry } from '../useTvChannels'
import { blockGeometry, isLiveNow } from './timeline-blocks'
import s from '../EpgGrid.module.scss'

export interface ProgramBlockProps {
  entry: EpgEntry
  hue: number
  clock: number
  windowStart: Date
  windowMs: number
  busy: boolean
  onWatch: () => void
}

export function ProgramBlock({
  entry,
  hue,
  clock,
  windowStart,
  windowMs,
  busy,
  onWatch,
}: ProgramBlockProps) {
  const { left, width } = blockGeometry(entry, windowStart, windowMs)
  const isNow = isLiveNow(entry, clock)

  return (
    <button
      className={s.block}
      data-live={isNow}
      style={
        {
          '--hue': hue,
          left: `${left.toString()}%`,
          width: `${width.toString()}%`,
        } as React.CSSProperties
      }
      disabled={!isNow || busy}
      onClick={onWatch}
      title={entry.program.title}
    >
      {isNow && <span className={s.blockLiveDot} />}
      <span className={s.blockTitle}>
        {busy && isNow ? 'Tuning in…' : entry.program.title}
      </span>
    </button>
  )
}
