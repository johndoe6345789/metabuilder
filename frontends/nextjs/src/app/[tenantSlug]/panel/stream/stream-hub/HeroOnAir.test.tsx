import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { HeroOnAir } from './HeroOnAir'

const channel = {
  id: 'c1',
  name: 'News 1',
  channel_number: 1,
  is_live: true,
  viewers: 0,
  hls_url: '',
  dash_url: '',
  epgEntries: [],
  epgNow: {
    channel_id: 'c1',
    channel_name: 'News 1',
    start_time: '2026-01-01T10:00:00Z',
    end_time: '2026-01-01T11:00:00Z',
    program: { id: 'p1', title: 'Morning Show', description: 'desc' } as never,
  },
}

describe('HeroOnAir', () => {
  it('shows the channel name and program title', () => {
    render(<HeroOnAir channel={channel} onWatch={vi.fn()} />)
    expect(screen.getByText(/News 1/)).toBeTruthy()
    expect(screen.getByText('Morning Show')).toBeTruthy()
  })

  it('shows the "next" program when there is one', () => {
    const withNext = {
      ...channel,
      epgNext: {
        channel_id: 'c1',
        channel_name: 'News 1',
        start_time: '2026-01-01T11:00:00Z',
        end_time: '2026-01-01T12:00:00Z',
        program: { id: 'p2', title: 'Weather' } as never,
      },
    }
    render(<HeroOnAir channel={withNext} onWatch={vi.fn()} />)
    expect(screen.getByText('Next: Weather')).toBeTruthy()
  })

  it('calls onWatch with the channel id', () => {
    const onWatch = vi.fn()
    render(<HeroOnAir channel={channel} onWatch={onWatch} />)
    fireEvent.click(screen.getByText('Watch now'))
    expect(onWatch).toHaveBeenCalledWith('c1')
  })
})
