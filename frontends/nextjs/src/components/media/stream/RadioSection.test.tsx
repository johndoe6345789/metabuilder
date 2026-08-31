import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const radio = vi.hoisted(() => ({
  channels: [] as {
    id: string
    name: string
    is_live: boolean
    listeners: number
    stream_url: string
  }[],
  loading: false,
  error: null as string | null,
  listen: vi.fn(async () => 'https://stream'),
  stop: vi.fn(async () => {}),
}))

vi.mock('./useRadioChannels', () => ({
  useRadioChannels: () => radio,
}))

import { RadioSection } from './RadioSection'

describe('RadioSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    radio.channels = []
    radio.loading = false
    radio.error = null
  })

  it('shows a loading state', () => {
    radio.loading = true
    render(<RadioSection />)
    expect(screen.getByText('Loading stations…')).toBeTruthy()
  })

  it('shows an error state', () => {
    radio.error = 'offline'
    render(<RadioSection />)
    expect(screen.getByText('offline')).toBeTruthy()
  })

  it('shows the empty-stations notice with no channels', () => {
    render(<RadioSection />)
    expect(screen.getByText(/No stations yet/)).toBeTruthy()
  })

  it('tunes in to a station end to end', () => {
    radio.channels = [
      { id: 'a', name: 'Jazz FM', is_live: true, listeners: 1, stream_url: 'x' },
    ]
    render(<RadioSection />)
    fireEvent.click(screen.getByText('▶ Listen'))
    expect(radio.listen).toHaveBeenCalledWith('a')
  })
})
