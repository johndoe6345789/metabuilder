import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { StationsGrid } from './StationsGrid'

const channels = [
  { id: 'a', name: 'Jazz FM', is_live: true, listeners: 1, stream_url: 'x' },
  { id: 'b', name: 'Rock FM', is_live: false, listeners: 0, stream_url: 'y' },
]

describe('StationsGrid', () => {
  it('renders one card per channel', () => {
    render(
      <StationsGrid channels={channels} busyId={null} onListen={vi.fn()} />
    )
    expect(screen.getByText('Jazz FM')).toBeTruthy()
    expect(screen.getByText('Rock FM')).toBeTruthy()
  })

  it('marks only the busy card as tuning in', () => {
    render(
      <StationsGrid channels={channels} busyId="a" onListen={vi.fn()} />
    )
    expect(screen.getByText('Tuning in…')).toBeTruthy()
    expect(screen.getByText('▶ Listen')).toBeTruthy()
  })

  it('passes the channel id and name through to onListen', () => {
    const onListen = vi.fn()
    render(
      <StationsGrid channels={channels} busyId={null} onListen={onListen} />
    )
    fireEvent.click(screen.getAllByText('▶ Listen')[1])
    expect(onListen).toHaveBeenCalledWith('b', 'Rock FM')
  })
})
