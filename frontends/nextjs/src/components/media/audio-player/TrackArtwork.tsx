'use client'

import s from '../AudioPlayer.module.scss'

export interface TrackArtworkProps {
  artwork: string | undefined
  title: string | undefined
}

export function TrackArtwork({ artwork, title }: TrackArtworkProps) {
  if (artwork !== undefined) {
    return <img src={artwork} alt={title} className={s.artwork} />
  }
  return (
    <div className={s.artworkPlaceholder}>
      <span className="material-symbols-rounded">music_note</span>
    </div>
  )
}
