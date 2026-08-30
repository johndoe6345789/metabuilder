import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
  epgEntries: [],
} as never

describe('ChannelRow label', () => {
  it('shows the channel name and number', () => {
    render(
      <ChannelRow
        channel={channel}
        rowIndex={0}
        clock={clock}
        windowStart={windowStart}
        windowEnd={windowEnd}
        busyId={null}
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByText('News 1')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('falls back to an id-derived label with no channel number', () => {
    render(
      <ChannelRow
        channel={{ ...channel, channel_number: 0, id: 'abcd' }}
        rowIndex={0}
        clock={clock}
        windowStart={windowStart}
        windowEnd={windowEnd}
        busyId={null}
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByText('ABC')).toBeTruthy()
  })

  it('shows a message when nothing is scheduled in the window', () => {
    render(
      <ChannelRow
        channel={channel}
        rowIndex={0}
        clock={clock}
        windowStart={windowStart}
        windowEnd={windowEnd}
        busyId={null}
        onWatch={vi.fn()}
      />
    )
    expect(
      screen.getByText('Nothing scheduled in this window')
    ).toBeTruthy()
  })
})
