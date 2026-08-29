'use client'

import { useMemo, useState, useEffect } from 'react'
import type { ScheduledChannel } from './useTvChannels'
import { hueFor } from './hue'
import s from './EpgGrid.module.scss'

// matches Sky's guide: a couple hours of grid at a time
const WINDOW_MINUTES = 150
const SLOT_MINUTES = 30

interface Props {
  channels: ScheduledChannel[]
  busyId: string | null
  onWatch: (channelId: string, title: string) => void
}

function floorToSlot(d: Date): Date {
  const ms = SLOT_MINUTES * 60 * 1000
  return new Date(Math.floor(d.getTime() / ms) * ms)
}

export function EpgGrid({ channels, busyId, onWatch }: Props) {
  // Recomputed every 30s so the NOW line and "now airing" block tracks
  // reality without needing a full data refetch.
  const [clock, setClock] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => {
      setClock(Date.now())
    }, 30000)
    return () => {
      clearInterval(id)
    }
  }, [])

  const { windowStart, windowEnd, slots, nowPct } = useMemo(() => {
    const start = floorToSlot(new Date(clock))
    const end = new Date(start.getTime() + WINDOW_MINUTES * 60 * 1000)
    const slotCount = WINDOW_MINUTES / SLOT_MINUTES
    const slotList = Array.from(
      { length: slotCount },
      (_, i) => new Date(start.getTime() + i * SLOT_MINUTES * 60 * 1000)
    )
    const pct =
      ((clock - start.getTime()) / (end.getTime() - start.getTime())) * 100
    return {
      windowStart: start,
      windowEnd: end,
      slots: slotList,
      nowPct: Math.min(100, Math.max(0, pct)),
    }
  }, [clock])

  const windowMs = windowEnd.getTime() - windowStart.getTime()

  return (
    <div className={s.grid}>
      <div className={s.timeHeader}>
        <div className={s.channelColSpacer} />
        <div className={s.timeSlots}>
          {slots.map(slot => (
            <span key={slot.toISOString()} className={s.timeLabel}>
              {slot.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          ))}
        </div>
      </div>

      <div className={s.rows}>
        <div
          className={s.nowLine}
          style={{
            left: `calc(168px + (100% - 168px) * ${(nowPct / 100).toString()})`,
          }}
        />

        {channels.map((ch, rowIndex) => {
          const hue = hueFor(ch.id)
          const blocks = ch.epgEntries.filter(e => {
            const eStart = new Date(e.start_time).getTime()
            const eEnd = new Date(e.end_time).getTime()
            return eEnd > windowStart.getTime() && eStart < windowEnd.getTime()
          })

          return (
            <div
              key={ch.id}
              className={s.row}
              style={{ '--i': rowIndex } as React.CSSProperties}
            >
              <div className={s.channelLabel}>
                <span
                  className={s.channelNum}
                  style={{ '--hue': hue } as React.CSSProperties}
                >
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
                {blocks.map(entry => {
                  const eStart = new Date(entry.start_time).getTime()
                  const eEnd = new Date(entry.end_time).getTime()
                  const left = Math.max(
                    0,
                    ((eStart - windowStart.getTime()) / windowMs) * 100
                  )
                  const right = Math.min(
                    100,
                    ((eEnd - windowStart.getTime()) / windowMs) * 100
                  )
                  const width = Math.max(2, right - left)
                  const isNow = eStart <= clock && eEnd > clock
                  return (
                    <button
                      key={entry.program.id}
                      className={s.block}
                      data-live={isNow}
                      style={
                        {
                          '--hue': hue,
                          left: `${left.toString()}%`,
                          width: `${width.toString()}%`,
                        } as React.CSSProperties
                      }
                      disabled={!isNow || busyId === ch.id}
                      onClick={() => {
                        onWatch(ch.id, ch.name)
                      }}
                      title={entry.program.title}
                    >
                      {isNow && <span className={s.blockLiveDot} />}
                      <span className={s.blockTitle}>
                        {busyId === ch.id && isNow
                          ? 'Tuning in…'
                          : entry.program.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
