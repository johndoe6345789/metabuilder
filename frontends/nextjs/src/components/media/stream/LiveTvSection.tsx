'use client'

import { useLiveTv } from './live-tv/use-live-tv'
import { NowWatchingPanel } from './live-tv/NowWatchingPanel'
import { EmptyChannelsNotice } from './live-tv/EmptyChannelsNotice'
import { EpgGrid } from './EpgGrid'
import s from './LiveTvSection.module.scss'

interface Props {
  // Set by the hero's "Watch now" button to jump straight into a channel
  // without the user having to find it in the guide first. `nonce` changes
  // on every click so the same channel can be re-triggered.
  externalWatchTrigger?: { channelId: string; nonce: number } | null
}

export function LiveTvSection({ externalWatchTrigger }: Props) {
  const {
    channels,
    loading,
    error,
    nowWatching,
    busyId,
    handleWatch,
    handleStopWatching,
  } = useLiveTv(externalWatchTrigger)

  if (loading) return <div className={s.status}>Loading channels…</div>
  if (error !== null) return <div className={s.statusError}>{error}</div>

  if (nowWatching !== null) {
    return (
      <NowWatchingPanel
        title={nowWatching.title}
        url={nowWatching.url}
        onBack={() => {
          void handleStopWatching()
        }}
      />
    )
  }

  if (channels.length === 0) return <EmptyChannelsNotice />

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
