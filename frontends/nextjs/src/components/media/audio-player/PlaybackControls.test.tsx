import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { PlaybackControls } from './PlaybackControls'

const base = {
  playing: false,
  onToggle: vi.fn(),
  isLive: undefined,
  current: 30,
  duration: 120,
  onSeek: vi.fn(),
  vol: 1,
  onVolChange: vi.fn(),
}

describe('PlaybackControls', () => {
  it('shows play when paused', () => {
    render(<PlaybackControls {...base} />)
    expect(screen.getByText('play_arrow')).toBeTruthy()
  })

  it('shows pause when playing', () => {
    render(<PlaybackControls {...base} playing />)
    expect(screen.getByText('pause')).toBeTruthy()
  })

  it('calls onToggle when the play button is clicked', () => {
    const onToggle = vi.fn()
    render(<PlaybackControls {...base} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('play_arrow'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('shows a seek bar and times when not live', () => {
    render(<PlaybackControls {...base} />)
    expect(screen.getByText('0:30')).toBeTruthy()
    expect(screen.getByText('2:00')).toBeTruthy()
  })

  it('hides the seek bar and times when live', () => {
    render(<PlaybackControls {...base} isLive />)
    expect(screen.queryByText('0:30')).toBeNull()
  })

  it('reports a volume change', () => {
    const onVolChange = vi.fn()
    render(<PlaybackControls {...base} onVolChange={onVolChange} />)
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[sliders.length - 1], {
      target: { value: '0.3' },
    })
    expect(onVolChange).toHaveBeenCalledOnce()
  })
})
