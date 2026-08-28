'use client'

import { useState, useEffect, useRef } from 'react'
import { VideoPlayer } from '../VideoPlayer'
import { useTvChannels } from './useTvChannels'
import { EpgGrid } from './EpgGrid'
import s from './LiveTvSection.module.scss'

interface Props {
  // Set by the hero's "Watch now" button to jump straight into a channel
  // without the user having to find it in the guide first. `nonce` changes
  // on every click so the same channel can be re-triggered.
  externalWatchTrigger?: { channelId: string; nonce: number } | null
}

export function LiveTvSection({ externalWatchTrigger }: Props) {
  const { channels, loading, error, watch, stop } = useTvChannels()
  const [nowWatching, setNowWatching] = useState<{
    id: string
    url: string
    title: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const lastTriggerNonce = useRef<number | null>(null)

  const handleWatch = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await watch(channelId)
      setNowWatching({ id: channelId, url, title })
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    if (externalWatchTrigger === null || externalWatchTrigger === undefined)
      return
    if (externalWatchTrigger.nonce === lastTriggerNonce.current) return
    lastTriggerNonce.current = externalWatchTrigger.nonce
    const ch = channels.find(c => c.id === externalWatchTrigger.channelId)
    if (ch !== undefined) void handleWatch(ch.id, ch.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalWatchTrigger, channels])

  const handleStopWatching = async () => {
    if (nowWatching === null) return
    const id = nowWatching.id
    setNowWatching(null)
    await stop(id)
  }

  if (loading) return <div className={s.status}>Loading channels…</div>
  if (error !== null) return <div className={s.statusError}>{error}</div>

  if (nowWatching !== null) {
    return (
      <div className={s.player}>
        <div className={s.playerHeader}>
          <div className={s.playerTitleGroup}>
            <span className={s.playerLive}>
              <span className={s.playerLiveDot} />
              LIVE
            </span>
            <h2 className={s.playerTitle}>{nowWatching.title}</h2>
          </div>
          <button
            className={s.backBtn}
            onClick={() => {
              void handleStopWatching()
            }}
          >
            ← Back to guide
          </button>
        </div>
        <div className={s.playerFrame}>
          <VideoPlayer src={nowWatching.url} title={nowWatching.title} />
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className={s.status}>
        No channels yet — create one via <code>POST /api/tv/channels</code> and
        schedule a program via <code>PUT .../schedule</code>.
      </div>
    )
  }

  return (
    <EpgGrid
      channels={channels}
      busyId={busyId}
      onWatch={(id, title) => {
        void handleWatch(id, title)
      }}
    />
  )
}
