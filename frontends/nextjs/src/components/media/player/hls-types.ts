/**
 * The slice of hls.js this player uses.
 *
 * Structural rather than imported so the recovery behaviour can be
 * tested against a fake: hls.js loads a media pipeline and a worker, and
 * a test that needs one of those is a test nobody runs.
 */

export interface HlsErrorData {
  fatal?: boolean
  type?: string
  details?: string
}

export interface HlsLike {
  loadSource: (src: string) => void
  attachMedia: (media: HTMLMediaElement) => void
  on: (
    event: string,
    handler: (name: string, data: HlsErrorData) => void
  ) => void
  startLoad: () => void
  recoverMediaError: () => void
  destroy: () => void
  readonly liveSyncPosition: number | null
}

export interface HlsConstructor {
  new (config: Record<string, unknown>): HlsLike
  isSupported: () => boolean
  Events: { ERROR: string; MANIFEST_PARSED: string }
}

export type HlsLoader = () => Promise<{ default: HlsConstructor }>

/**
 * Live tuning.
 *
 * `liveMaxLatencyDurationCount` is the one that matters: hls.js leaves it
 * unset, and unset means it never seeks forward, so a stream that falls
 * behind stays behind for the rest of the session. Ten target durations
 * is far enough not to fight normal buffering and near enough that
 * nobody is watching minutes-old "live" television.
 */
export const LIVE_CONFIG = {
  enableWorker: true,
  liveSyncDurationCount: 3,
  liveMaxLatencyDurationCount: 10,
}
