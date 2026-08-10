'use client'

import { useState } from 'react'
import { AudioPlayer } from '../AudioPlayer'
import { useRadioChannels } from './useRadioChannels'
import { hueFor } from './hue'
import s from './RadioSection.module.scss'

export function RadioSection() {
  const { channels, loading, error, listen, stop } = useRadioChannels()
  const [nowPlaying, setNowPlaying] = useState<{ id: string, url: string, title: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleListen = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await listen(channelId)
      setNowPlaying({ id: channelId, url, title })
    } finally {
      setBusyId(null)
    }
  }

  const handleStop = async () => {
    if (nowPlaying === null) return
    const id = nowPlaying.id
    setNowPlaying(null)
    await stop(id)
  }

  if (loading) return <div className={s.status}>Loading stations…</div>
  if (error !== null) return <div className={s.statusError}>{error}</div>

  if (channels.length === 0) {
    return (
      <div className={s.status}>
        No stations yet — create one via <code>POST /api/radio/channels</code> and
        set a playlist via <code>PUT .../playlist</code>.
      </div>
    )
  }

  return (
    <div className={s.root}>
      {nowPlaying !== null && (
        <div className={s.nowPlayingBar} style={{ '--hue': hueFor(nowPlaying.id) } as React.CSSProperties}>
          <div className={s.eq}>
            <span /><span /><span /><span />
          </div>
          <div className={s.nowPlayingInfo}>
            <span className={s.nowPlayingLabel}>Listening live</span>
            <span className={s.nowPlayingTitle}>{nowPlaying.title}</span>
          </div>
          <AudioPlayer src={nowPlaying.url} title={nowPlaying.title} isLive />
          <button className={s.stopBtn} onClick={() => { void handleStop() }}>Stop</button>
        </div>
      )}

      <div className={s.grid}>
        {channels.map((ch, i) => (
          <div
            key={ch.id}
            className={s.card}
            style={{ '--hue': hueFor(ch.id), '--i': i } as React.CSSProperties}
          >
            <div className={s.cardGlow} aria-hidden />
            <div className={s.cardTop}>
              <span className={s.stationName}>{ch.name}</span>
              {ch.is_live && <span className={s.liveBadge}><span className={s.liveDot} />{ch.listeners} listening</span>}
            </div>
            {ch.now_playing !== undefined ? (
              <span className={s.trackTitle}>
                {ch.now_playing.title}
                {ch.now_playing.artist !== '' && <span className={s.trackArtist}> — {ch.now_playing.artist}</span>}
              </span>
            ) : (
              <span className={s.noTrack}>Nothing queued</span>
            )}
            <button
              className={s.listenBtn}
              disabled={busyId === ch.id}
              onClick={() => { void handleListen(ch.id, ch.name) }}
            >
              {busyId === ch.id ? 'Tuning in…' : '▶ Listen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
