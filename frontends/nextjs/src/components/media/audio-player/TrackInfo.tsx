'use client'

import s from '../AudioPlayer.module.scss'

export interface TrackInfoProps {
  title: string | undefined
  artist: string | undefined
  isLive: boolean | undefined
}

export function TrackInfo({ title, artist, isLive }: TrackInfoProps) {
  return (
    <div className={s.info}>
      <p className={s.title}>{title ?? 'Unknown track'}</p>
      <p className={s.artist}>{artist ?? ''}</p>
      {isLive === true && <span className={s.livePill}>LIVE</span>}
    </div>
  )
}
