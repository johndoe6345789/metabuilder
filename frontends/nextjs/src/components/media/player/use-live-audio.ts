'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { retryDelayMs } from './hls-recovery'

/** Tries before telling the listener; a station that has actually gone
 *  off air should not spin for ever. */
export const MAX_AUDIO_RECONNECTS = 4

/**
 * Keeps a live audio stream playing.
 *
 * A live stream is an open connection, and any blip ends it: the element
 * fires `error`, or `ended` -- which for live means the connection
 * dropped, since a live stream has no end. Nothing listened to either,
 * so the play button simply went back to paused and the listener was
 * left thinking it "stopped randomly".
 *
 * Only for live: reloading a normal track would restart it from the
 * beginning, which is not a repair.
 */
export function useLiveAudio(
  audio: RefObject<HTMLAudioElement | null>,
  src: string,
  isLive: boolean
): { error: string | null } {
  const [failure, setFailure] = useState<{ src: string } | null>(null)
  const tried = useRef(0)

  useEffect(() => {
    const el = audio.current
    if (el === null || !isLive || src === '') return undefined
    tried.current = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const reconnect = (): void => {
      if (cancelled) return
      if (tried.current >= MAX_AUDIO_RECONNECTS) {
        setFailure({ src })
        return
      }
      const attempt = tried.current
      tried.current += 1
      timer = setTimeout(() => {
        if (cancelled) return
        el.load()
        void el.play().catch(() => undefined)
      }, retryDelayMs(attempt))
    }

    const onPlaying = (): void => {
      tried.current = 0
    }

    el.addEventListener('error', reconnect)
    el.addEventListener('ended', reconnect)
    el.addEventListener('playing', onPlaying)
    return () => {
      cancelled = true
      if (timer !== null) clearTimeout(timer)
      el.removeEventListener('error', reconnect)
      el.removeEventListener('ended', reconnect)
      el.removeEventListener('playing', onPlaying)
    }
  }, [audio, src, isLive])

  return {
    error:
      failure?.src === src
        ? 'The station stopped and would not come back. Try again.'
        : null,
  }
}
