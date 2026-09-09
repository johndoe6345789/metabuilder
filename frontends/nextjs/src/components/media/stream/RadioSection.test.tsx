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
  streamUrl: (path: string) => `https://audio.test${path}`,
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

  /**
   * A station already on air is joined where it is; asking the daemon to
   * start it again restarts it for everyone already listening.
   */
  it('joins a station that is already on air', () => {
    radio.channels = [
      {
        id: 'a',
        name: 'Jazz FM',
        is_live: true,
        listeners: 1,
        stream_url: '/jazz.mp3',
      },
    ]
    render(<RadioSection />)
    fireEvent.click(screen.getByText('▶ Listen'))
    expect(radio.listen).not.toHaveBeenCalled()
  })

  it('puts a station on air when it is not running', () => {
    radio.channels = [
      {
        id: 'a',
        name: 'Jazz FM',
        is_live: false,
        listeners: 0,
        stream_url: '',
      },
    ]
    render(<RadioSection />)
    fireEvent.click(screen.getByText('▶ Listen'))
    expect(radio.listen).toHaveBeenCalledWith('a')
  })
})
