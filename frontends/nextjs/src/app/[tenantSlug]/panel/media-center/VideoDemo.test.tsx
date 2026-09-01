import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { VideoDemo } from './VideoDemo'

describe('VideoDemo', () => {
  it('does not show a player before a URL is loaded', () => {
    render(<VideoDemo />)
    expect(screen.queryByText('sample.mp4')).toBeNull()
  })

  it('shows the video player with the file name once loaded', () => {
    render(<VideoDemo />)
    const input = screen.getByPlaceholderText(/media\/sample\.mp4/)
    fireEvent.change(input, {
      target: { value: 'http://localhost:9000/media/clip.mp4' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.getByText('clip.mp4')).toBeTruthy()
  })

  it('keeps the Load button disabled until a URL is entered', () => {
    render(<VideoDemo />)
    const button = screen.getByText('Load').closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('enables the Load button once a URL is entered', () => {
    render(<VideoDemo />)
    const input = screen.getByPlaceholderText(/media\/sample\.mp4/)
    fireEvent.change(input, {
      target: { value: 'http://localhost:9000/media/clip.mp4' },
    })
    const button = screen.getByText('Load').closest('button')
    expect(button?.disabled).toBe(false)
  })

  it('trims whitespace from the URL before activating', () => {
    render(<VideoDemo />)
    const input = screen.getByPlaceholderText(/media\/sample\.mp4/)
    fireEvent.change(input, {
      target: { value: '  http://localhost:9000/media/clip.mp4  ' },
    })
    fireEvent.click(screen.getByText('Load'))
    expect(screen.getByText('clip.mp4')).toBeTruthy()
  })
})
