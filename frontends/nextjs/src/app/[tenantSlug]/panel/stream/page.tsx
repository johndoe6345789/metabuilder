'use client'

import { useState, useMemo } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { LiveTvSection } from '@/components/media/stream/LiveTvSection'
import { RadioSection } from '@/components/media/stream/RadioSection'
import { RetroLauncher } from '@/components/media/RetroLauncher'
import { AppsRow } from '@/components/media/stream/AppsRow'
import { useTvChannels } from '@/components/media/stream/useTvChannels'
import { hueFor } from '@/components/media/stream/hue'
import s from './page.module.scss'

type SectionId = 'tv' | 'radio' | 'retro'

const SECTIONS: { id: SectionId; label: string; glyph: string }[] = [
  { id: 'tv', label: 'Live TV', glyph: '▶' },
  { id: 'radio', label: 'Radio', glyph: '~' },
  { id: 'retro', label: 'Retro Games', glyph: '◆' },
]

function progressPercent(start: string, end: string): number {
  const now = Date.now()
  const s0 = new Date(start).getTime()
  const e0 = new Date(end).getTime()
  if (e0 <= s0) return 0
  return Math.min(100, Math.max(0, ((now - s0) / (e0 - s0)) * 100))
}

function Hero({ onWatch }: { onWatch: (channelId: string) => void }) {
  const { channels } = useTvChannels()
  const onAir = useMemo(
    () => channels.find(c => c.epgNow !== undefined),
    [channels]
  )

  if (onAir?.epgNow === undefined) {
    return (
      <div className={s.hero} data-empty="true">
        <div className={s.heroGlow} aria-hidden />
        <div className={s.heroContent}>
          <span className={s.heroEyebrow}>MetaBuilder Stream</span>
          <h1 className={s.heroTitle}>
            Your own broadcast,
            <br />
            running live.
          </h1>
          <p className={s.heroSub}>
            Schedule a program and it shows up here — live TV, radio, and retro
            gaming, unified in one signal.
          </p>
        </div>
      </div>
    )
  }

  const pct = progressPercent(onAir.epgNow.start_time, onAir.epgNow.end_time)

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
        <h1 className={s.heroTitle}>{onAir.epgNow.program.title}</h1>
        {onAir.epgNow.program.description !== '' && (
          <p className={s.heroSub}>{onAir.epgNow.program.description}</p>
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

function StreamHubContent() {
  const [active, setActive] = useState<SectionId>('tv')
  const [watchTrigger, setWatchTrigger] = useState<{
    channelId: string
    nonce: number
  } | null>(null)

  const handleHeroWatch = (channelId: string) => {
    setActive('tv')
    setWatchTrigger({ channelId, nonce: Date.now() })
  }

  return (
    <div className={s.root}>
      <Hero onWatch={handleHeroWatch} />

      <AppsRow />

      <nav className={s.pillNav} role="tablist" aria-label="Stream sections">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            role="tab"
            aria-selected={active === section.id}
            className={s.pill}
            data-active={active === section.id}
            style={{ '--i': i } as React.CSSProperties}
            onClick={() => {
              setActive(section.id)
            }}
          >
            <span className={s.pillGlyph}>{section.glyph}</span>
            {section.label}
          </button>
        ))}
        <div
          className={s.pillIndicator}
          style={
            {
              '--pos': SECTIONS.findIndex(sec => sec.id === active),
            } as React.CSSProperties
          }
        />
      </nav>

      <div className={s.panelStage}>
        <div key={active} className={s.panel}>
          {active === 'tv' && (
            <LiveTvSection externalWatchTrigger={watchTrigger} />
          )}
          {active === 'radio' && <RadioSection />}
          {active === 'retro' && (
            <div className={s.retroShell}>
              <RetroLauncher />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StreamHubPage() {
  return (
    <LevelGate minLevel={2} levelName="User">
      <StreamHubContent />
    </LevelGate>
  )
}
