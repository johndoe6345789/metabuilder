'use client'

import { formatTime } from './format-time'
import s from '../AudioPlayer.module.scss'

export interface PlaybackControlsProps {
  playing: boolean
  onToggle: () => void
  isLive: boolean | undefined
  current: number
  duration: number
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  vol: number
  onVolChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PlaybackControls(props: PlaybackControlsProps) {
  const { playing, onToggle, isLive, current, duration } = props

  return (
    <div className={s.controls}>
      <button className={s.playBtn} onClick={onToggle}>
        <span className="material-symbols-rounded">
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </button>
      {isLive !== true && (
        <>
          <span className={s.time}>{formatTime(current)}</span>
          <input
            type="range"
            className={s.seek}
            min={0}
            max={duration}
            step={0.1}
            value={current}
            onChange={props.onSeek}
          />
          <span className={s.time}>{formatTime(duration)}</span>
        </>
      )}
      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
        volume_up
      </span>
      <input
        type="range"
        className={s.vol}
        min={0}
        max={1}
        step={0.02}
        value={props.vol}
        onChange={props.onVolChange}
      />
    </div>
  )
}
