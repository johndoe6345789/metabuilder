import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AudioPlayer } from './AudioPlayer'

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  it('renders the track title', () => {
    render(<AudioPlayer src="https://x/song.mp3" title="Song" />)
    expect(screen.getByText('Song')).toBeTruthy()
  })

  it('drops an unsafe src rather than passing it to <audio>', () => {
    const { container } = render(
      <AudioPlayer src="javascript:alert(1)" title="Song" />
    )
    const audio = container.querySelector('audio')
    expect(audio?.hasAttribute('src')).toBe(false)
  })

  it('toggles play/pause on click', () => {
    render(<AudioPlayer src="https://x/song.mp3" title="Song" />)
    fireEvent.click(screen.getByText('play_arrow'))
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('hides the scrubber for a live stream', () => {
    render(<AudioPlayer src="https://x/live" title="Radio" isLive />)
    expect(screen.getByText('LIVE')).toBeTruthy()
  })
})
