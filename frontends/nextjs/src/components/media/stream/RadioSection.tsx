'use client'

import { useRadioChannels } from './useRadioChannels'
import { useRadioPlayback } from './radio/use-radio-playback'
import { NowPlayingBar } from './radio/NowPlayingBar'
import { EmptyStationsNotice } from './radio/EmptyStationsNotice'
import { StationsGrid } from './radio/StationsGrid'
import s from './RadioSection.module.scss'

export function RadioSection() {
  const { channels, loading, error, listen, stop } = useRadioChannels()
  const { nowPlaying, busyId, handleListen, handleStop } = useRadioPlayback({
    listen,
    stop,
  })

  if (loading) return <div className={s.status}>Loading stations…</div>
  if (error !== null) return <div className={s.statusError}>{error}</div>
  if (channels.length === 0) return <EmptyStationsNotice />

  return (
    <div className={s.root}>
      {nowPlaying !== null && (
        <NowPlayingBar
          id={nowPlaying.id}
          url={nowPlaying.url}
          title={nowPlaying.title}
          onStop={() => {
            void handleStop()
          }}
        />
      )}

      <StationsGrid
        channels={channels}
        busyId={busyId}
        onListen={(id, title) => {
          void handleListen(id, title)
        }}
      />
    </div>
  )
}
