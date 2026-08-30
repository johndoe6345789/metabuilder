'use client'

import { useCallback, useRef, useState } from 'react'

/** The <audio> ref, its playback state, and the three controls (toggle,
 *  seek, volume) that drive it -- kept apart from the DOM markup so the
 *  markup stays a thin, presentational assembly. */
export function useAudioElement() {
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

  return {
    audioRef,
    playing,
    setPlaying,
    current,
    setCurrent,
    duration,
    setDuration,
    vol,
    toggle,
    seek,
    changeVol,
  }
}
