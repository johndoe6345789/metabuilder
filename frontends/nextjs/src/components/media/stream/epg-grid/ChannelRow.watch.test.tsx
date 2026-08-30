import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ChannelRow } from './ChannelRow'

const windowStart = new Date('2026-01-01T10:00:00Z')
const windowEnd = new Date('2026-01-01T12:30:00Z')
const clock = new Date('2026-01-01T10:30:00Z').getTime()

const channel = {
  id: 'c1',
  name: 'News 1',
  channel_number: 5,
  is_live: true,
  viewers: 0,
  hls_url: '',
  dash_url: '',
  epgEntries: [
    {
      channel_id: 'c1',
      channel_name: 'News 1',
      start_time: '2026-01-01T10:00:00Z',
      end_time: '2026-01-01T11:00:00Z',
      program: { id: 'p1', title: 'Morning Show' } as never,
    },
  ],
} as never

describe('ChannelRow watch flow', () => {
  it('reports the channel id and name when a live block is watched', () => {
    const onWatch = vi.fn()
    render(
      <ChannelRow
        channel={channel}
        rowIndex={0}
        clock={clock}
        windowStart={windowStart}
        windowEnd={windowEnd}
        busyId={null}
        onWatch={onWatch}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onWatch).toHaveBeenCalledWith('c1', 'News 1')
  })
})
