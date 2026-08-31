import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StationCard } from './StationCard'

const channel = {
  id: 'c1',
  name: 'Jazz FM',
  is_live: true,
  listeners: 42,
  stream_url: 'https://x',
  now_playing: {
    id: 'p1',
    title: 'Take Five',
    artist: 'Dave Brubeck',
    album: '',
  },
}

describe('StationCard', () => {
  it('shows the station name', () => {
    render(
      <StationCard
        channel={channel}
        index={0}
        busy={false}
        onListen={vi.fn()}
      />
    )
    expect(screen.getByText('Jazz FM')).toBeTruthy()
  })

  it('shows the live listener count when live', () => {
    render(
      <StationCard
        channel={channel}
        index={0}
        busy={false}
        onListen={vi.fn()}
      />
    )
    expect(screen.getByText('42 listening')).toBeTruthy()
  })

  it('shows no live badge when not live', () => {
    render(
      <StationCard
        channel={{ ...channel, is_live: false }}
        index={0}
        busy={false}
        onListen={vi.fn()}
      />
    )
    expect(screen.queryByText('42 listening')).toBeNull()
  })

  it('shows the now-playing track and artist', () => {
    render(
      <StationCard
        channel={channel}
        index={0}
        busy={false}
        onListen={vi.fn()}
      />
    )
    expect(screen.getByText('Take Five')).toBeTruthy()
    expect(screen.getByText('— Dave Brubeck')).toBeTruthy()
  })

  it('shows a placeholder with nothing queued', () => {
    render(
      <StationCard
        channel={{ ...channel, now_playing: undefined }}
        index={0}
        busy={false}
        onListen={vi.fn()}
      />
    )
    expect(screen.getByText('Nothing queued')).toBeTruthy()
  })
})
