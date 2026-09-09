'use client'

import { useEffect, useRef, useState } from 'react'
import {
  giveUpMessage,
  isBehindLive,
  recoveryFor,
  retryDelayMs,
  type Attempts,
} from './hls-recovery'
import { LIVE_CONFIG, type HlsLike, type HlsLoader } from './hls-types'

const defaultLoader: HlsLoader = () =>
  import('hls.js') as unknown as ReturnType<HlsLoader>

export interface UseHlsVideoOptions {
  autoPlay?: boolean
  /** Injectable for tests; the real one dynamically imports hls.js. */
  loader?: HlsLoader
}

/**
 * Plays `src` into `video`, and keeps it playing.
 *
 * The player used to attach hls.js and listen to nothing, so any fatal
 * error ended the stream permanently and silently, and a stream that
 * drifted behind the live edge stayed there. See hls-recovery.ts.
 */
export function useHlsVideo(
  video: HTMLVideoElement | null,
  src: string,
  options: UseHlsVideoOptions = {}
): { error: string | null } {
  // Kept with the source it belongs to, so switching channel clears it
  // without a setState in the effect body -- which would cascade a
  // render before the stream has even been asked for.
  const [failure, setFailure] = useState<{
    src: string
    message: string
  } | null>(null)
  const { autoPlay = false, loader = defaultLoader } = options
  const tried = useRef<Attempts>({ network: 0, media: 0 })

  useEffect(() => {
    if (video === null || src === '') return undefined
    tried.current = { network: 0, media: 0 }

    let live: HlsLike | null = null
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    /** Snap forward when we have fallen off the live edge. */
    const catchUp = (): void => {
      if (live === null) return
      const target = live.liveSyncPosition
      if (target !== null && isBehindLive(video.currentTime, target)) {
        video.currentTime = target
      }
    }

    void loader().then(({ default: Hls }) => {
      if (cancelled) return
      if (!Hls.isSupported()) {
        // Safari plays HLS itself and hls.js reports unsupported there;
        // without this the one browser with native support played nothing.
        if (video.canPlayType('application/vnd.apple.mpegurl') !== '') {
          video.src = src
          if (autoPlay) void video.play().catch(() => undefined)
        }
        return
      }
      const hls = new Hls(LIVE_CONFIG)
      live = hls
      hls.on(Hls.Events.ERROR, (_name, data) => {
        const action = recoveryFor(data, tried.current)
        if (action === 'ignore') return
        if (action === 'give-up') {
          setFailure({ src, message: giveUpMessage(data.type) })
          return
        }
        if (action === 'recover-media') {
          tried.current.media += 1
          hls.recoverMediaError()
          return
        }
        const attempt = tried.current.network
        tried.current.network += 1
        timers.push(
          setTimeout(() => {
            if (cancelled) return
            hls.startLoad()
            catchUp()
          }, retryDelayMs(attempt))
        )
      })
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) void video.play().catch(() => undefined)
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    })

    // A live stream that stalls resumes wherever it left off, which is
    // behind by however long the stall lasted.
    video.addEventListener('waiting', catchUp)
    video.addEventListener('playing', catchUp)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      video.removeEventListener('waiting', catchUp)
      video.removeEventListener('playing', catchUp)
      live?.destroy()
      live = null
    }
  }, [video, src, autoPlay, loader])

  return { error: failure?.src === src ? failure.message : null }
}
