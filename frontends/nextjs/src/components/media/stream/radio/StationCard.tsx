'use client'

import type { RadioChannel } from '../useRadioChannels'
import { hueFor } from '../hue'
import s from '../RadioSection.module.scss'

export interface StationCardProps {
  channel: RadioChannel
  index: number
  busy: boolean
  onListen: () => void
}

export function StationCard(props: StationCardProps) {
  const { channel: ch, index, busy, onListen } = props
  return (
    <div
      className={s.card}
      style={{ '--hue': hueFor(ch.id), '--i': index } as React.CSSProperties}
    >
      <div className={s.cardGlow} aria-hidden />
      <div className={s.cardTop}>
        <span className={s.stationName}>{ch.name}</span>
        {ch.is_live && (
          <span className={s.liveBadge}>
            <span className={s.liveDot} />
            {ch.listeners} listening
          </span>
        )}
      </div>
      {ch.now_playing !== undefined ? (
        <span className={s.trackTitle}>
          {ch.now_playing.title}
          {ch.now_playing.artist !== '' && (
            <span className={s.trackArtist}> — {ch.now_playing.artist}</span>
          )}
        </span>
      ) : (
        <span className={s.noTrack}>Nothing queued</span>
      )}
      <button className={s.listenBtn} disabled={busy} onClick={onListen}>
        {busy ? 'Tuning in…' : '▶ Listen'}
      </button>
    </div>
  )
}
