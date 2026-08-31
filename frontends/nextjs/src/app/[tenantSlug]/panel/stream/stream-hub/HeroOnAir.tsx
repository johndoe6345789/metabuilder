'use client'

import type { ScheduledChannel } from '@/components/media/stream/useTvChannels'
import { hueFor } from '@/components/media/stream/hue'
import { progressPercent } from './progress-percent'
import s from '../page.module.scss'

export interface HeroOnAirProps {
  channel: ScheduledChannel
  onWatch: (channelId: string) => void
}

export function HeroOnAir({ channel: onAir, onWatch }: HeroOnAirProps) {
  const epgNow = onAir.epgNow
  if (epgNow === undefined) return null
  const pct = progressPercent(epgNow.start_time, epgNow.end_time)

  return (
    <div
      className={s.hero}
      style={{ '--hue': hueFor(onAir.id) } as React.CSSProperties}
    >
      <div className={s.heroGlow} aria-hidden />
      <div className={s.heroNoise} aria-hidden />
      <div className={s.heroContent}>
        <div className={s.heroLive}>
          <span className={s.pulseDot} />
          ON AIR NOW · {onAir.name}
        </div>
        <h1 className={s.heroTitle}>{epgNow.program.title}</h1>
        {epgNow.program.description !== '' && (
          <p className={s.heroSub}>{epgNow.program.description}</p>
        )}
        <div className={s.heroMeta}>
          <div className={s.heroProgress}>
            <div
              className={s.heroProgressFill}
              style={{ width: `${pct.toString()}%` }}
            />
          </div>
          {onAir.epgNext !== undefined && (
            <span className={s.heroNext}>
              Next: {onAir.epgNext.program.title}
            </span>
          )}
        </div>
        <button
          className={s.heroCta}
          onClick={() => {
            onWatch(onAir.id)
          }}
        >
          <span className={s.heroCtaIcon}>▶</span> Watch now
        </button>
      </div>
    </div>
  )
}
