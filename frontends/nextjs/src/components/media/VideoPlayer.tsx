'use client'

import { useState } from 'react'
import { isSafeMediaSrc } from './mediaUrl'
import { useHlsVideo } from './player/use-hls-video'
import s from './VideoPlayer.module.scss'

export interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  className?: string
}

const isHls = (src: string): boolean => src.includes('.m3u8')

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay,
  className,
}: VideoPlayerProps) {
  // State, not a ref: the hook has to run again when the element appears,
  // and a ref assignment does not re-render.
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  const safe = isSafeMediaSrc(src) ? src : ''
  const { error } = useHlsVideo(video, isHls(safe) ? safe : '', { autoPlay })

  return (
    <div className={`${s.root} ${className ?? ''}`}>
      {title !== undefined && (
        <div className={s.titleBar}>
          <span className="material-symbols-rounded">play_circle</span>
          <span>{title}</span>
        </div>
      )}
      {error !== null && (
        <div className={s.error} role="alert">
          {error}
        </div>
      )}
      <video
        ref={setVideo}
        controls
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        // An HLS source is handed to hls.js, which feeds the element
        // through MediaSource; setting it here as well would make the
        // browser fetch the playlist a second time and fail on it.
        src={safe === '' || isHls(safe) ? undefined : safe}
        className={s.video}
      />
    </div>
  )
}
