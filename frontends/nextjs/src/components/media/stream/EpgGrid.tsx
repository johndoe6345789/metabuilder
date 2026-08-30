'use client'

import type { ScheduledChannel } from './useTvChannels'
import { useEpgClock } from './epg-grid/use-epg-clock'
import { TimeHeader } from './epg-grid/TimeHeader'
import { NowLine } from './epg-grid/NowLine'
import { ChannelRow } from './epg-grid/ChannelRow'
import s from './EpgGrid.module.scss'

interface Props {
  channels: ScheduledChannel[]
  busyId: string | null
  onWatch: (channelId: string, title: string) => void
}

export function EpgGrid({ channels, busyId, onWatch }: Props) {
  const { clock, windowStart, windowEnd, slots, nowPct } = useEpgClock()

  return (
    <div className={s.grid}>
      <TimeHeader slots={slots} />

      <div className={s.rows}>
        <NowLine nowPct={nowPct} />

        {channels.map((ch, rowIndex) => (
          <ChannelRow
            key={ch.id}
            channel={ch}
            rowIndex={rowIndex}
            clock={clock}
            windowStart={windowStart}
            windowEnd={windowEnd}
            busyId={busyId}
            onWatch={onWatch}
          />
        ))}
      </div>
    </div>
  )
}
