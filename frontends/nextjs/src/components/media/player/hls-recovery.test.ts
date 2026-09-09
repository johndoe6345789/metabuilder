import { describe, expect, it } from 'vitest'

import {
  giveUpMessage,
  isBehindLive,
  MAX_MEDIA_RECOVERIES,
  MAX_NETWORK_RETRIES,
  MEDIA_ERROR,
  NETWORK_ERROR,
  recoveryFor,
  retryDelayMs,
} from './hls-recovery'

const none = { network: 0, media: 0 }

/**
 * The player listened to no hls.js events at all, and hls.js does not
 * recover by itself -- so one segment 404 as the live window rolled, or
 * one decode hiccup, stopped playback for good with nothing said.
 */
describe('recoveryFor', () => {
  it('reloads after a fatal network error', () => {
    expect(recoveryFor({ fatal: true, type: NETWORK_ERROR }, none)).toBe(
      'restart-load'
    )
  })

  it('recovers the decoder after a fatal media error', () => {
    expect(recoveryFor({ fatal: true, type: MEDIA_ERROR }, none)).toBe(
      'recover-media'
    )
  })

  /**
   * hls.js reports many more non-fatal errors than fatal ones -- a
   * segment it retried itself, a gap it bridged. Restarting on those
   * would interrupt a stream that is playing perfectly.
   */
  it.each([
    ['no fatal flag', { type: NETWORK_ERROR }],
    ['explicitly not fatal', { fatal: false, type: MEDIA_ERROR }],
  ])('ignores an error that is %s', (_case, error) => {
    expect(recoveryFor(error, none)).toBe('ignore')
  })

  it('gives up once the network retries are spent', () => {
    const tried = { network: MAX_NETWORK_RETRIES, media: 0 }
    expect(recoveryFor({ fatal: true, type: NETWORK_ERROR }, tried)).toBe(
      'give-up'
    )
  })

  it('gives up once the media recoveries are spent', () => {
    const tried = { network: 0, media: MAX_MEDIA_RECOVERIES }
    expect(recoveryFor({ fatal: true, type: MEDIA_ERROR }, tried)).toBe(
      'give-up'
    )
  })

  it('counts each kind separately', () => {
    const tried = { network: MAX_NETWORK_RETRIES, media: 0 }
    expect(recoveryFor({ fatal: true, type: MEDIA_ERROR }, tried)).toBe(
      'recover-media'
    )
  })

  it.each([undefined, 'keySystemError', 'muxError'])(
    'gives up on a fatal %s, which has no documented recovery',
    type => {
      expect(recoveryFor({ fatal: true, type }, none)).toBe('give-up')
    }
  )
})

describe('retryDelayMs', () => {
  it('waits longer each time rather than hammering a flapping link', () => {
    const delays = [0, 1, 2, 3].map(retryDelayMs)
    expect(delays).toEqual([500, 1000, 2000, 4000])
  })

  it('holds at the longest step', () => {
    expect(retryDelayMs(99)).toBe(4000)
  })
})

describe('giveUpMessage', () => {
  it.each([
    [NETWORK_ERROR, 'not sending it any more'],
    [MEDIA_ERROR, 'keep decoding'],
    [undefined, 'could not be restarted'],
  ])('says something true for %s', (type, expected) => {
    expect(giveUpMessage(type)).toContain(expected)
  })
})

/**
 * hls.js only seeks forward past `liveMaxLatencyDuration`, which is unset
 * by default -- so after a stall, a pause, or a spell in a background
 * tab, playback carried on minutes behind the edge for ever.
 */
describe('isBehindLive', () => {
  it('is behind when the gap is bigger than the tolerance', () => {
    expect(isBehindLive(100, 130)).toBe(true)
  })

  it('is not behind within the tolerance', () => {
    expect(isBehindLive(100, 105)).toBe(false)
  })

  it('is not behind when ahead of the sync point', () => {
    // Routine on a low-latency stream, and not drift.
    expect(isBehindLive(140, 130)).toBe(false)
  })

  it.each([null, Number.NaN, Number.POSITIVE_INFINITY])(
    'has no opinion when the live position is %p',
    position => {
      expect(isBehindLive(100, position)).toBe(false)
    }
  )

  it('takes a tolerance of its own', () => {
    expect(isBehindLive(100, 110, 5)).toBe(true)
    expect(isBehindLive(100, 110, 30)).toBe(false)
  })
})
