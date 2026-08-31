'use client'

import { AudioPlayer } from '../../AudioPlayer'
import { hueFor } from '../hue'
import s from '../RadioSection.module.scss'

export interface NowPlayingBarProps {
  id: string
  url: string
  title: string
  onStop: () => void
}

export function NowPlayingBar({ id, url, title, onStop }: NowPlayingBarProps) {
  return (
    <div
      className={s.nowPlayingBar}
      style={{ '--hue': hueFor(id) } as React.CSSProperties}
    >
      <div className={s.eq}>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={s.nowPlayingInfo}>
        <span className={s.nowPlayingLabel}>Listening live</span>
        <span className={s.nowPlayingTitle}>{title}</span>
      </div>
      <AudioPlayer src={url} title={title} isLive />
      <button className={s.stopBtn} onClick={onStop}>
        Stop
      </button>
    </div>
  )
}
