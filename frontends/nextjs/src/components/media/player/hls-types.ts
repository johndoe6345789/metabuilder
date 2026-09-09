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
 * What the stream is for.
 *
 * Watching and playing want opposite things. Television should be
 * smooth: sitting a few segments back absorbs a slow segment without a
 * visible stall, and nobody minds being three seconds behind the studio.
 * A game is a control loop -- the picture is feedback for what your
 * thumb just did -- so every second of buffer is a second of lag, and
 * the same settings that make television smooth make a game unplayable.
 */
export type StreamKind = 'broadcast' | 'interactive'

/**
 * `liveMaxLatencyDurationCount` is the one that matters for both: hls.js
 * leaves it unset, and unset means it never seeks forward, so a stream
 * that falls behind stays behind for the rest of the session.
 */
export const HLS_CONFIG: Record<StreamKind, Record<string, unknown>> = {
  broadcast: {
    enableWorker: true,
    liveSyncDurationCount: 3,
    liveMaxLatencyDurationCount: 10,
  },
  interactive: {
    enableWorker: true,
    // As close to the edge as the playlist allows, and low-latency parts
    // where the daemon publishes them.
    lowLatencyMode: true,
    liveSyncDurationCount: 1,
    liveMaxLatencyDurationCount: 3,
    // Speeding up slightly to close a gap is far less disruptive in a
    // game than the alternative, which is jumping the picture.
    maxLiveSyncPlaybackRate: 1.5,
    // Nothing rewinds during a game, so holding a back buffer is memory
    // spent on something nobody can reach.
    backBufferLength: 0,
  },
}

/** How far behind the edge is too far, per kind. */
export const DRIFT_TOLERANCE_S: Record<StreamKind, number> = {
  broadcast: 12,
  // A game that is a second and a half behind is already hard to play;
  // past that, snapping forward is kinder than staying behind.
  interactive: 1.5,
}
