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

/**
 * `watch()` throws when the daemon refuses or answers without a stream
 * URL, and nothing caught it: the spinner cleared, no player appeared,
 * and the rejection went unhandled. From the viewer's side that is a
 * "Watch" button that works sometimes and does nothing other times.
 */
describe('when the channel will not start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tv.watch.mockRejectedValueOnce(new Error('HTTP 503'))
  })

  it('says so instead of failing silently', async () => {
    const { result } = renderHook(() => useLiveTv())

    await act(() => result.current.handleWatch('a', 'News'))

    expect(result.current.watchError).toContain('News')
    expect(result.current.nowWatching).toBeNull()
  })

  it('clears the spinner', async () => {
    const { result } = renderHook(() => useLiveTv())

    await act(() => result.current.handleWatch('a', 'News'))

    expect(result.current.busyId).toBeNull()
  })

  it('forgets the complaint once a channel does start', async () => {
    const { result } = renderHook(() => useLiveTv())
    await act(() => result.current.handleWatch('a', 'News'))
    expect(result.current.watchError).not.toBeNull()

    await act(() => result.current.handleWatch('a', 'News'))

    expect(result.current.watchError).toBeNull()
    expect(result.current.nowWatching).not.toBeNull()
  })
})

/**
 * The trigger's nonce was marked as used before the channel was looked
 * up, so a "Watch now" pressed while the channel list was still loading
 * consumed the trigger and started nothing -- and the guard then blocked
 * it for ever.
 */
describe('a watch asked for before the channels have loaded', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts once the channel appears', async () => {
    const missing = tv.channels
    tv.channels = []
    const trigger = { channelId: 'a', nonce: 7 }
    const { rerender } = renderHook(
      (props: { trigger: typeof trigger }) => useLiveTv(props.trigger),
      { initialProps: { trigger } }
    )
    expect(tv.watch).not.toHaveBeenCalled()

    tv.channels = missing
    rerender({ trigger })

    await waitFor(() => {
      expect(tv.watch).toHaveBeenCalledWith('a')
    })
  })
})
