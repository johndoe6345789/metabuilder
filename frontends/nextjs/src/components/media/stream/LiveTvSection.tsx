'use client'

import { useState } from 'react'
import { Typography } from '@/m3'
import { VideoPlayer } from '../VideoPlayer'
import { useTvChannels } from './useTvChannels'
import s from './LiveTvSection.module.scss'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// % through the currently-airing program, for the EPG progress bar.
function progressPercent(start: string, end: string): number {
  const now = Date.now()
  const s0 = new Date(start).getTime()
  const e0 = new Date(end).getTime()
  if (e0 <= s0) return 0
  return Math.min(100, Math.max(0, ((now - s0) / (e0 - s0)) * 100))
}

export function LiveTvSection() {
  const { channels, loading, error, watch, stop } = useTvChannels()
  const [nowWatching, setNowWatching] = useState<{ id: string, url: string, title: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleWatch = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await watch(channelId)
      setNowWatching({ id: channelId, url, title })
    } finally {
      setBusyId(null)
    }
  }

  const handleStopWatching = async () => {
    if (nowWatching === null) return
    const id = nowWatching.id
    setNowWatching(null)
    await stop(id)
  }

  if (loading) return <Typography variant="body2" color="text.secondary">Loading channels…</Typography>
  if (error !== null) return <Typography variant="body2" color="error">{error}</Typography>

  if (nowWatching !== null) {
    return (
      <div className={s.player}>
        <div className={s.playerHeader}>
          <Typography variant="h6">{nowWatching.title}</Typography>
          <button className={s.backBtn} onClick={() => { void handleStopWatching() }}>
            ← Back to guide
          </button>
        </div>
        <VideoPlayer src={nowWatching.url} title={nowWatching.title} />
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No channels yet — create one via <code>POST /api/tv/channels</code> and
        schedule a program via <code>PUT .../schedule</code>.
      </Typography>
    )
  }

  return (
    <div className={s.guide}>
      {channels.map(ch => (
        <div key={ch.id} className={s.row}>
          <div className={s.channelInfo}>
            <span className={s.channelNumber}>{ch.channel_number > 0 ? ch.channel_number : ch.id}</span>
            <Typography variant="subtitle1">{ch.name}</Typography>
            {ch.is_live && <span className={s.liveBadge}>LIVE</span>}
          </div>

          <div className={s.nowNext}>
            {ch.epgNow !== undefined ? (
              <div className={s.nowSlot}>
                <Typography variant="body2" className={s.programTitle}>{ch.epgNow.program.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(ch.epgNow.start_time)}–{formatTime(ch.epgNow.end_time)}
                </Typography>
                <div className={s.progressTrack}>
                  <div
                    className={s.progressFill}
                    style={{ width: `${progressPercent(ch.epgNow.start_time, ch.epgNow.end_time).toString()}%` }}
                  />
                </div>
              </div>
            ) : (
              <Typography variant="body2" color="text.secondary">Nothing scheduled</Typography>
            )}
            {ch.epgNext !== undefined && (
              <Typography variant="caption" color="text.secondary" className={s.upNext}>
                Up next: {ch.epgNext.program.title} at {formatTime(ch.epgNext.start_time)}
              </Typography>
            )}
          </div>

          <button
            className={s.watchBtn}
            disabled={busyId === ch.id || ch.epgNow === undefined}
            onClick={() => { void handleWatch(ch.id, ch.name) }}
          >
            {busyId === ch.id ? 'Tuning in…' : 'Watch'}
          </button>
        </div>
      ))}
    </div>
  )
}
