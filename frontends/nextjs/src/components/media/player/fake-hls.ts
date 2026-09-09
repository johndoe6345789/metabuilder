import { vi } from 'vitest'

import type { HlsConstructor, HlsErrorData, HlsLike } from './hls-types'

/**
 * A stand-in for hls.js.
 *
 * The real one loads a media pipeline and a worker; a test that needs
 * those is a test nobody runs, and the behaviour worth testing here is
 * what the player does when hls.js reports trouble.
 */
export interface FakeHls extends HlsLike {
  /** Fire an ERROR the way hls.js would. */
  emitError: (data: HlsErrorData) => void
  emitManifestParsed: () => void
  config: Record<string, unknown>
  liveSyncPosition: number | null
}

export function fakeHls(): {
  Ctor: HlsConstructor
  instances: FakeHls[]
} {
  const instances: FakeHls[] = []

  class Fake {
    static isSupported = () => true
    static Events = { ERROR: 'hlsError', MANIFEST_PARSED: 'hlsManifestParsed' }

    handlers = new Map<string, (name: string, data: HlsErrorData) => void>()
    liveSyncPosition: number | null = null
    loadSource = vi.fn()
    attachMedia = vi.fn()
    startLoad = vi.fn()
    recoverMediaError = vi.fn()
    destroy = vi.fn()

    constructor(public config: Record<string, unknown>) {
      instances.push(this)
    }

    on = (
      event: string,
      handler: (name: string, data: HlsErrorData) => void
    ): void => {
      this.handlers.set(event, handler)
    }

    emitError = (data: HlsErrorData): void => {
      this.handlers.get('hlsError')?.('hlsError', data)
    }

    emitManifestParsed = (): void => {
      this.handlers.get('hlsManifestParsed')?.('hlsManifestParsed', {})
    }
  }

  return { Ctor: Fake, instances }
}
