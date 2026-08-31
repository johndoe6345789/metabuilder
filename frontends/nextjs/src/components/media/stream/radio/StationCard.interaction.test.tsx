import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { StationCard } from './StationCard'

const channel = {
  id: 'c1',
  name: 'Jazz FM',
  is_live: true,
  listeners: 42,
  stream_url: 'https://x',
}

describe('StationCard interaction', () => {
  it('shows tuning-in only while busy', () => {
    render(<StationCard channel={channel} index={0} busy onListen={vi.fn()} />)
    expect(screen.getByText('Tuning in…')).toBeTruthy()
  })

  it('calls onListen when clicked', () => {
    const onListen = vi.fn()
    render(
      <StationCard
        channel={channel}
        index={0}
        busy={false}
        onListen={onListen}
      />
    )
    fireEvent.click(screen.getByText('▶ Listen'))
    expect(onListen).toHaveBeenCalledOnce()
  })
})
