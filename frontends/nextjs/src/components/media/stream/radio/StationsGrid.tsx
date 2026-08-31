'use client'

import type { RadioChannel } from '../useRadioChannels'
import { StationCard } from './StationCard'
import s from '../RadioSection.module.scss'

export interface StationsGridProps {
  channels: RadioChannel[]
  busyId: string | null
  onListen: (channelId: string, title: string) => void
}

export function StationsGrid(props: StationsGridProps) {
  const { channels, busyId, onListen } = props
  return (
    <div className={s.grid}>
      {channels.map((ch, i) => (
        <StationCard
          key={ch.id}
          channel={ch}
          index={i}
          busy={busyId === ch.id}
          onListen={() => {
            onListen(ch.id, ch.name)
          }}
        />
      ))}
    </div>
  )
}
