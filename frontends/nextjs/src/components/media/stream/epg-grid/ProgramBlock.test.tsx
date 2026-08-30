import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ProgramBlock } from './ProgramBlock'

const windowStart = new Date('2026-01-01T10:00:00Z')
const windowMs = 150 * 60 * 1000

const liveEntry = {
  channel_id: 'c1',
  channel_name: 'C1',
  start_time: '2026-01-01T10:00:00Z',
  end_time: '2026-01-01T11:00:00Z',
  program: { id: 'p1', title: 'Now Playing' } as never,
}

const clockDuring = new Date('2026-01-01T10:30:00Z').getTime()
const clockBefore = new Date('2026-01-01T09:00:00Z').getTime()

describe('ProgramBlock', () => {
  it('shows the program title', () => {
    render(
      <ProgramBlock
        entry={liveEntry}
        hue={100}
        clock={clockBefore}
        windowStart={windowStart}
        windowMs={windowMs}
        busy={false}
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByText('Now Playing')).toBeTruthy()
  })

  it('shows "Tuning in…" only while live and busy', () => {
    render(
      <ProgramBlock
        entry={liveEntry}
        hue={100}
        clock={clockDuring}
        windowStart={windowStart}
        windowMs={windowMs}
        busy
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByText('Tuning in…')).toBeTruthy()
  })

  it('disables the block when not currently live', () => {
    render(
      <ProgramBlock
        entry={liveEntry}
        hue={100}
        clock={clockBefore}
        windowStart={windowStart}
        windowMs={windowMs}
        busy={false}
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true)
  })

  it('calls onWatch when a live block is clicked', () => {
    const onWatch = vi.fn()
    render(
      <ProgramBlock
        entry={liveEntry}
        hue={100}
        clock={clockDuring}
        windowStart={windowStart}
        windowMs={windowMs}
        busy={false}
        onWatch={onWatch}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onWatch).toHaveBeenCalledOnce()
  })
})
