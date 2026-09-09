import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useRadioPlayback } from './use-radio-playback'

describe('useRadioPlayback', () => {
  it('tracks busy by channel id while tuning in', async () => {
    const listen = vi.fn(async () => 'https://stream')
    const { result } = renderHook(() =>
      useRadioPlayback({ listen, stop: vi.fn(async () => {}) })
    )

    await act(async () => result.current.handleListen('c1', 'Jazz FM'))

    expect(listen).toHaveBeenCalledWith('c1')
    expect(result.current.nowPlaying).toEqual({
      id: 'c1',
      url: 'https://stream',
      title: 'Jazz FM',
    })
    expect(result.current.busyId).toBeNull()
  })

  it('stops the current station and clears nowPlaying', async () => {
    const stop = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useRadioPlayback({ listen: vi.fn(async () => 'https://x'), stop })
    )

    await act(async () => result.current.handleListen('c1', 'Jazz FM'))
    await act(async () => result.current.handleStop())

    expect(stop).toHaveBeenCalledWith('c1')
    expect(result.current.nowPlaying).toBeNull()
  })

  it('does nothing when asked to stop while nothing plays', async () => {
    const stop = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useRadioPlayback({ listen: vi.fn(async () => 'https://x'), stop })
    )

    await act(async () => result.current.handleStop())

    expect(stop).not.toHaveBeenCalled()
  })
})

/**
 * Same shape as live TV: `listen()` throws when the daemon refuses or
 * answers without a stream URL, nothing caught it, and the spinner just
 * cleared -- so tuning in worked sometimes and did nothing other times,
 * with an unhandled rejection behind it.
 */
describe('when the station will not start', () => {
  it('says so instead of failing silently', async () => {
    const listen = vi.fn().mockRejectedValue(new Error('HTTP 503'))
    const { result } = renderHook(() =>
      useRadioPlayback({ listen, stop: vi.fn() })
    )

    await act(() => result.current.handleListen('r1', 'Jazz FM'))

    expect(result.current.listenError).toContain('Jazz FM')
    expect(result.current.nowPlaying).toBeNull()
    expect(result.current.busyId).toBeNull()
  })

  it('forgets the complaint once a station does start', async () => {
    const listen = vi
      .fn()
      .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValue('https://stream')
    const { result } = renderHook(() =>
      useRadioPlayback({ listen, stop: vi.fn() })
    )
    await act(() => result.current.handleListen('r1', 'Jazz FM'))

    await act(() => result.current.handleListen('r1', 'Jazz FM'))

    expect(result.current.listenError).toBeNull()
    expect(result.current.nowPlaying).not.toBeNull()
  })

  it('does not leave a dead bar up when stopping is refused', async () => {
    const stop = vi.fn().mockRejectedValue(new Error('gone'))
    const { result } = renderHook(() =>
      useRadioPlayback({ listen: vi.fn().mockResolvedValue('u'), stop })
    )
    await act(() => result.current.handleListen('r1', 'Jazz FM'))

    await act(() => result.current.handleStop())

    expect(result.current.nowPlaying).toBeNull()
  })
})
