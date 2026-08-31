import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const tv = vi.hoisted(() => ({
  channels: [] as { id: string; epgNow?: unknown }[],
}))

vi.mock('@/components/media/stream/useTvChannels', () => ({
  useTvChannels: () => tv,
}))

import { Hero } from './Hero'

describe('Hero', () => {
  it('shows the empty state with nothing on air', () => {
    tv.channels = []
    render(<Hero onWatch={vi.fn()} />)
    expect(screen.getByText(/Schedule a program/)).toBeTruthy()
  })

  it('shows the on-air state once a channel has epgNow', () => {
    tv.channels = [
      {
        id: 'a',
        epgNow: {
          start_time: '2026-01-01T10:00:00Z',
          end_time: '2026-01-01T11:00:00Z',
          program: { title: 'Morning Show', description: '' },
        },
      },
    ]
    render(<Hero onWatch={vi.fn()} />)
    expect(screen.getByText('Morning Show')).toBeTruthy()
  })
})
