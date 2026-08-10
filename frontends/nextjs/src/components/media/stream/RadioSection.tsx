'use client'

import { useState } from 'react'
import { Typography } from '@/m3'
import { AudioPlayer } from '../AudioPlayer'
import { useRadioChannels } from './useRadioChannels'
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

  if (loading) return <Typography variant="body2" color="text.secondary">Loading stations…</Typography>
  if (error !== null) return <Typography variant="body2" color="error">{error}</Typography>

  if (channels.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No stations yet — create one via <code>POST /api/radio/channels</code> and
        set a playlist via <code>PUT .../playlist</code>.
      </Typography>
    )
  }

  return (
    <div className={s.list}>
      {nowPlaying !== null && (
        <div className={s.nowPlayingBar}>
          <div>
            <Typography variant="subtitle2">{nowPlaying.title}</Typography>
            <Typography variant="caption" color="text.secondary">Listening live</Typography>
          </div>
          <AudioPlayer src={nowPlaying.url} title={nowPlaying.title} isLive />
          <button className={s.stopBtn} onClick={() => { void handleStop() }}>Stop</button>
        </div>
      )}

      {channels.map(ch => (
        <div key={ch.id} className={s.row}>
          <div className={s.info}>
            <Typography variant="subtitle1">{ch.name}</Typography>
            {ch.now_playing !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {ch.now_playing.title}
                {ch.now_playing.artist !== '' && ` — ${ch.now_playing.artist}`}
              </Typography>
            )}
            {ch.is_live && <span className={s.liveBadge}>{ch.listeners} listening</span>}
          </div>
          <button
            className={s.listenBtn}
            disabled={busyId === ch.id}
            onClick={() => { void handleListen(ch.id, ch.name) }}
          >
            {busyId === ch.id ? 'Tuning in…' : 'Listen'}
          </button>
        </div>
      ))}
    </div>
  )
}
