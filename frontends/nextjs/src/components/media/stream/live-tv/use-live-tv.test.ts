import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const tv = vi.hoisted(() => ({
  channels: [{ id: 'a', name: 'News' }] as { id: string; name: string }[],
  loading: false,
  error: null as string | null,
  watch: vi.fn(async () => 'https://stream'),
  stop: vi.fn(async () => {}),
}))

vi.mock('../useTvChannels', () => ({
  useTvChannels: () => tv,
}))

import { useLiveTv } from './use-live-tv'

describe('useLiveTv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes through the channel list, loading, and error', () => {
    const { result } = renderHook(() => useLiveTv())
    expect(result.current.channels).toEqual(tv.channels)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('tracks the busy id while watching, then clears it', async () => {
    const { result } = renderHook(() => useLiveTv())

    await act(async () => result.current.handleWatch('a', 'News'))

    expect(tv.watch).toHaveBeenCalledWith('a')
    expect(result.current.nowWatching).toEqual({
      id: 'a',
      url: 'https://stream',
      title: 'News',
    })
    expect(result.current.busyId).toBeNull()
  })

  it('stops the current channel and clears nowWatching', async () => {
    const { result } = renderHook(() => useLiveTv())

    await act(async () => result.current.handleWatch('a', 'News'))
    await act(async () => result.current.handleStopWatching())

    expect(tv.stop).toHaveBeenCalledWith('a')
    expect(result.current.nowWatching).toBeNull()
  })

  it('does nothing when asked to stop while nothing is watching', async () => {
    const { result } = renderHook(() => useLiveTv())

    await act(async () => result.current.handleStopWatching())

    expect(tv.stop).not.toHaveBeenCalled()
  })

  it('watches the channel named by an external trigger', async () => {
    type Trigger = { channelId: string; nonce: number } | null
    const { rerender, result } = renderHook(
      ({ trigger }: { trigger: Trigger }) => useLiveTv(trigger),
      { initialProps: { trigger: null as Trigger } }
    )

    rerender({ trigger: { channelId: 'a', nonce: 1 } })

    await waitFor(() => expect(result.current.nowWatching?.id).toBe('a'))
  })

  it('ignores a repeated trigger with the same nonce', async () => {
    const { rerender } = renderHook(({ trigger }) => useLiveTv(trigger), {
      initialProps: { trigger: { channelId: 'a', nonce: 1 } },
    })
    await waitFor(() => expect(tv.watch).toHaveBeenCalledTimes(1))

    rerender({ trigger: { channelId: 'a', nonce: 1 } })

    expect(tv.watch).toHaveBeenCalledTimes(1)
  })
})
