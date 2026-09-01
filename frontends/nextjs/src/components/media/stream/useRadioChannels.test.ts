import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const mediaChannelsHook = vi.hoisted(() => ({
  useMediaChannels: vi.fn(() => ({
    channels: [{ id: '1', name: 'Jazz' }],
    loading: false,
    error: null,
    refresh: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
}))
vi.mock('./use-media-channels', () => mediaChannelsHook)

import { useRadioChannels } from './useRadioChannels'

describe('useRadioChannels', () => {
  it('configures useMediaChannels for the radio service', () => {
    renderHook(() => useRadioChannels())
    expect(mediaChannelsHook.useMediaChannels).toHaveBeenCalledWith(
      expect.objectContaining({ service: 'radio', urlField: 'stream_url' })
    )
  })

  it('exposes start as listen and passes channels through unchanged', () => {
    const { result } = renderHook(() => useRadioChannels())
    const call = mediaChannelsHook.useMediaChannels.mock.results.at(-1)
    expect(result.current.channels).toEqual([{ id: '1', name: 'Jazz' }])
    expect(result.current.listen).toBe(call?.value.start)
  })

  it('passes stop and error/loading through unchanged', () => {
    const { result } = renderHook(() => useRadioChannels())
    const call = mediaChannelsHook.useMediaChannels.mock.results.at(-1)
    expect(result.current.stop).toBe(call?.value.stop)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
