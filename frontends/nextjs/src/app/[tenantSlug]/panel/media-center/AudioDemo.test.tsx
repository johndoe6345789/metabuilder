import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AudioDemo } from './AudioDemo'

describe('AudioDemo', () => {
  it('does not show a player before a URL is loaded', () => {
    render(<AudioDemo />)
    expect(screen.queryByText('Unknown track')).toBeNull()
  })

  it('shows the audio player with the file name once loaded', () => {
    render(<AudioDemo />)
    const input = screen.getByPlaceholderText(/music\/track\.mp3/)
    fireEvent.change(input, {
      target: { value: 'http://localhost:9000/music/song.mp3' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.getByText('song.mp3')).toBeTruthy()
  })

  it('marks a stream URL as live', () => {
    render(<AudioDemo />)
    const input = screen.getByPlaceholderText(/music\/track\.mp3/)
    fireEvent.change(input, {
      target: { value: 'http://localhost:8090/stream/mount1' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.getByText('LIVE')).toBeTruthy()
  })

  it('does not mark a plain file URL as live', () => {
    render(<AudioDemo />)
    const input = screen.getByPlaceholderText(/music\/track\.mp3/)
    fireEvent.change(input, {
      target: { value: 'http://localhost:9000/music/song.flac' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.queryByText('LIVE')).toBeNull()
  })

  it('trims whitespace from the URL before activating', () => {
    render(<AudioDemo />)
    const input = screen.getByPlaceholderText(/music\/track\.mp3/)
    fireEvent.change(input, {
      target: { value: '  http://localhost:9000/music/track.mp3  ' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.getByText('track.mp3')).toBeTruthy()
  })
})
