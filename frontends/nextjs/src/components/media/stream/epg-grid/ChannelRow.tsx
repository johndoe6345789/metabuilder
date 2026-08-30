'use client'

import type { ScheduledChannel } from '../useTvChannels'
import { hueFor } from '../hue'
import { inWindow } from './timeline-blocks'
import { ProgramBlock } from './ProgramBlock'
import s from '../EpgGrid.module.scss'

export interface ChannelRowProps {
  channel: ScheduledChannel
  rowIndex: number
  clock: number
  windowStart: Date
  windowEnd: Date
  busyId: string | null
  onWatch: (channelId: string, title: string) => void
}

export function ChannelRow({
  channel: ch,
  rowIndex,
  clock,
  windowStart,
  windowEnd,
  busyId,
  onWatch,
}: ChannelRowProps) {
  const hue = hueFor(ch.id)
  const blocks = inWindow(ch.epgEntries, windowStart, windowEnd)
  const windowMs = windowEnd.getTime() - windowStart.getTime()

  return (
    <div className={s.row} style={{ '--i': rowIndex } as React.CSSProperties}>
      <div className={s.channelLabel}>
        <span className={s.channelNum} style={{ '--hue': hue } as React.CSSProperties}>
          {ch.channel_number > 0
            ? ch.channel_number
            : ch.id.slice(0, 3).toUpperCase()}
        </span>
        <span className={s.channelName}>{ch.name}</span>
        {ch.epgNow !== undefined && <span className={s.liveDot} />}
      </div>

      <div className={s.timeline}>
        {blocks.length === 0 && (
          <div className={s.emptyTimeline}>
            Nothing scheduled in this window
          </div>
        )}
        {blocks.map(entry => (
          <ProgramBlock
            key={entry.program.id}
            entry={entry}
            hue={hue}
            clock={clock}
            windowStart={windowStart}
            windowMs={windowMs}
            busy={busyId === ch.id}
            onWatch={() => {
              onWatch(ch.id, ch.name)
            }}
          />
        ))}
      </div>
    </div>
  )
}
