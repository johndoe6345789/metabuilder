'use client'

import { useRef, useState, useCallback } from 'react'
import s from './AudioPlayer.module.scss'

export interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  artwork?: string
  isLive?: boolean
}

function fmt(sec: number): string {
  if (!isFinite(sec)) return '--:--'
  const m = Math.floor(sec / 60)
  const ss = Math.floor(sec % 60)
  return `${m}:${ss.toString().padStart(2, '0')}`
}

export function AudioPlayer({
  src, title, artist, artwork, isLive,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [vol, setVol] = useState(1)

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (el === null) return
    if (el.paused) {
      void el.play()
    } else {
      el.pause()
    }
  }, [])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (el === null) return
    el.currentTime = Number(e.target.value)
  }, [])

  const changeVol = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVol(v)
    if (audioRef.current !== null) audioRef.current.volume = v
  }, [])

  return (
    <div className={s.root}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => { setPlaying(true) }}
        onPause={() => { setPlaying(false) }}
        onTimeUpdate={() => {
          setCurrent(audioRef.current?.currentTime ?? 0)
        }}
        onDurationChange={() => {
          setDuration(audioRef.current?.duration ?? 0)
        }}
      />

      {artwork !== undefined && (
        <img src={artwork} alt={title} className={s.artwork} />
      )}
      {artwork === undefined && (
        <div className={s.artworkPlaceholder}>
          <span className="material-symbols-rounded">music_note</span>
        </div>
      )}

      <div className={s.info}>
        <p className={s.title}>{title ?? 'Unknown track'}</p>
        <p className={s.artist}>{artist ?? ''}</p>
        {isLive === true && <span className={s.livePill}>LIVE</span>}
      </div>

      <div className={s.controls}>
        <button className={s.playBtn} onClick={toggle}>
          <span className="material-symbols-rounded">
            {playing ? 'pause' : 'play_arrow'}
          </span>
        </button>
        {isLive !== true && (
          <>
            <span className={s.time}>{fmt(current)}</span>
            <input
              type="range"
              className={s.seek}
              min={0}
              max={duration}
              step={0.1}
              value={current}
              onChange={seek}
            />
            <span className={s.time}>{fmt(duration)}</span>
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
          value={vol}
          onChange={changeVol}
        />
      </div>
    </div>
  )
}
