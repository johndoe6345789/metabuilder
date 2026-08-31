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
