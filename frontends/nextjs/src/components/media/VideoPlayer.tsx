'use client'

import { useRef, useEffect } from 'react'
import type HlsType from 'hls.js'
import { isSafeMediaSrc } from './mediaUrl'
import s from './VideoPlayer.module.scss'

export interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<HlsType | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video === null || !src || !isSafeMediaSrc(src)) return undefined

    hlsRef.current?.destroy()
    hlsRef.current = null

    const isHls = src.includes('.m3u8')
    if (!isHls) {
      video.src = src
      return undefined
    }

    let active = true

    void import('hls.js').then(mod => {
      if (!active || videoRef.current === null) return
      const Hls = mod.default
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true })
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        hlsRef.current = hls
      } else if (video.canPlayType('application/vnd.apple.mpegurl') !== '') {
        video.src = src
      }
    })

    return () => {
      active = false
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src])

  return (
    <div className={`${s.root} ${className ?? ''}`}>
      {title !== undefined && (
        <div className={s.titleBar}>
          <span className="material-symbols-rounded">play_circle</span>
          <span>{title}</span>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        className={s.video}
      />
    </div>
  )
}
