import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { NowPlayingBar } from './NowPlayingBar'

describe('NowPlayingBar', () => {
  it('shows the playing title', () => {
    render(
      <NowPlayingBar id="c1" url="https://x" title="Jazz FM" onStop={vi.fn()} />
    )
    expect(screen.getAllByText('Jazz FM').length).toBeGreaterThan(0)
  })

  it('calls onStop when Stop is clicked', () => {
    const onStop = vi.fn()
    render(
      <NowPlayingBar id="c1" url="https://x" title="Jazz FM" onStop={onStop} />
    )
    fireEvent.click(screen.getByText('Stop'))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
