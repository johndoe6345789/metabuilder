import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const tv = vi.hoisted(() => ({
  channels: [] as { id: string; epgNow?: unknown }[],
}))

vi.mock('@/components/media/stream/useTvChannels', () => ({
  useTvChannels: () => tv,
}))

import { useOnAirChannel } from './use-on-air-channel'

describe('useOnAirChannel', () => {
  it('is undefined when nothing is on air', () => {
    tv.channels = [{ id: 'a' }, { id: 'b' }]
    const { result } = renderHook(() => useOnAirChannel())
    expect(result.current).toBeUndefined()
  })

  it('finds the channel currently airing something', () => {
    tv.channels = [{ id: 'a' }, { id: 'b', epgNow: { title: 'News' } }]
    const { result } = renderHook(() => useOnAirChannel())
    expect(result.current?.id).toBe('b')
  })
})
