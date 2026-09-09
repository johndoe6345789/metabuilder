/**
 * What to do when a live stream goes wrong, and when it has fallen behind.
 *
 * The player attached hls.js and listened to nothing. hls.js does not
 * recover on its own: its documented contract is that the application
 * handles `ERROR`, calling `startLoad()` for a fatal network error and
 * `recoverMediaError()` for a fatal media one. Without that, a single
 * segment 404 as the live window rolls -- routine on a live playlist --
 * or one decode hiccup stops playback dead, for good, with nothing on
 * screen to say why. That is a stream stopping "at the wrong time" and
 * starting and stopping "randomly".
 */

/** hls.js `ErrorTypes` values, as strings so this stays dependency-free. */
export const NETWORK_ERROR = 'networkError'
export const MEDIA_ERROR = 'mediaError'

export type Recovery = 'restart-load' | 'recover-media' | 'give-up' | 'ignore'

export interface Attempts {
  network: number
  media: number
}

/**
 * How many times to try before telling the viewer.
 *
 * Bounded because an unbounded retry against a channel that has actually
 * ended is a spinner for ever; the viewer is told instead.
 */
export const MAX_NETWORK_RETRIES = 4
export const MAX_MEDIA_RECOVERIES = 2

export interface HlsErrorLike {
  fatal?: boolean
  type?: string
}

export function recoveryFor(error: HlsErrorLike, tried: Attempts): Recovery {
  // hls.js reports far more non-fatal errors than fatal ones -- a missed
  // segment it retried itself, a gap it bridged. Acting on those would
  // restart a stream that is playing perfectly well.
  if (error.fatal !== true) return 'ignore'
  if (error.type === NETWORK_ERROR) {
    return tried.network < MAX_NETWORK_RETRIES ? 'restart-load' : 'give-up'
  }
  if (error.type === MEDIA_ERROR) {
    return tried.media < MAX_MEDIA_RECOVERIES ? 'recover-media' : 'give-up'
  }
  // Anything else fatal -- a key-system or mux error -- has no documented
  // recovery, so pretending otherwise just hides it.
  return 'give-up'
}

/** Growing gaps between network retries, so a flapping link is not hammered. */
export function retryDelayMs(attempt: number): number {
  const steps = [500, 1000, 2000, 4000]
  return steps[Math.min(attempt, steps.length - 1)]
}

/** What to tell the viewer when nothing more will be tried. */
export function giveUpMessage(type: string | undefined): string {
  if (type === NETWORK_ERROR) {
    return 'The stream stopped — the server is not sending it any more.'
  }
  if (type === MEDIA_ERROR) {
    return 'The stream stopped — this browser could not keep decoding it.'
  }
  return 'The stream stopped and could not be restarted.'
}

/**
 * How far behind the live edge is too far.
 *
 * hls.js only seeks forward when the gap passes `liveMaxLatencyDuration`,
 * and that is unset by default -- so after any stall, pause, or spell in
 * a background tab, playback carries on from wherever it was, minutes
 * behind, for ever. This is "live TV was not live".
 */
export const LIVE_DRIFT_TOLERANCE_S = 12

export function isBehindLive(
  currentTime: number,
  liveSyncPosition: number | null,
  tolerance: number = LIVE_DRIFT_TOLERANCE_S
): boolean {
  if (liveSyncPosition === null || !Number.isFinite(liveSyncPosition)) {
    return false
  }
  // Ahead of the sync point happens routinely on a low-latency stream and
  // is not drift.
  return liveSyncPosition - currentTime > tolerance
}
