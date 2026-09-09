import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useRadioPlayback } from './use-radio-playback'
import type { RadioChannel } from '../useRadioChannels'

const station = (over: Partial<RadioChannel> = {}): RadioChannel =>
  ({
    id: 'c1',
    name: 'Jazz FM',
    is_live: false,
    listeners: 0,
    stream_url: '',
    ...over,
  }) as RadioChannel

const setup = (
  over: {
    channels?: RadioChannel[]
    listen?: (id: string) => Promise<string>
  } = {}
) => {
  const listen = vi.fn(over.listen ?? (async () => 'https://stream'))
  const streamUrl = vi.fn((path: string) => `https://audio.test${path}`)
  const view = renderHook(() =>
    useRadioPlayback({
      channels: over.channels ?? [station()],
      listen,
      streamUrl,
    })
  )
  return { view, listen, streamUrl }
}

describe('useRadioPlayback', () => {
  it('puts a station on air when it is not running yet', async () => {
    const { view, listen } = setup()

    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    expect(listen).toHaveBeenCalledWith('c1')
    expect(view.result.current.nowPlaying).toEqual({
      id: 'c1',
      url: 'https://stream',
      title: 'Jazz FM',
    })
    expect(view.result.current.busyId).toBeNull()
  })

  /**
   * A station broadcasts whether or not anyone has it on. Listening used
   * to call `start`, which puts it on air -- restarting it for everyone
   * already listening.
   */
  it('joins a station already on air rather than restarting it', async () => {
    const { view, listen } = setup({
      channels: [station({ is_live: true, stream_url: '/jazz.mp3' })],
    })

    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    expect(listen).not.toHaveBeenCalled()
    expect(view.result.current.nowPlaying?.url).toBe(
      'https://audio.test/jazz.mp3'
    )
  })

  it('leaves the station on air when the listener tunes out', async () => {
    const { view } = setup({
      channels: [station({ is_live: true, stream_url: '/jazz.mp3' })],
    })
    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    act(() => {
      view.result.current.handleStop()
    })

    expect(view.result.current.nowPlaying).toBeNull()
  })

  it('does nothing when asked to stop while nothing plays', () => {
    const { view } = setup()

    act(() => {
      view.result.current.handleStop()
    })

    expect(view.result.current.nowPlaying).toBeNull()
  })
})

/**
 * `listen()` throws when the daemon refuses or answers without a stream
 * URL, and nothing caught it: the spinner cleared, no player appeared,
 * and the rejection went unhandled.
 */
describe('when the station will not start', () => {
  it('says so instead of failing silently', async () => {
    const { view } = setup({
      listen: async () => {
        throw new Error('HTTP 503')
      },
    })

    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    expect(view.result.current.listenError).toContain('Jazz FM')
    expect(view.result.current.nowPlaying).toBeNull()
    expect(view.result.current.busyId).toBeNull()
  })

  it('forgets the complaint once a station does start', async () => {
    let first = true
    const { view } = setup({
      listen: async () => {
        if (first) {
          first = false
          throw new Error('nope')
        }
        return 'https://stream'
      },
    })
    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    await act(async () => view.result.current.handleListen('c1', 'Jazz FM'))

    expect(view.result.current.listenError).toBeNull()
    expect(view.result.current.nowPlaying).not.toBeNull()
  })
})
