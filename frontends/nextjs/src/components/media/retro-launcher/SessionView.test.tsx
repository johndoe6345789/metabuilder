import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { SessionView } from './SessionView'

const session = {
  id: 'abcdef1234',
  system: 'nes' as const,
  romPath: '/roms/mario.nes',
  streamUrl: 'https://stream',
  startedAt: '2026-01-01T00:00:00Z',
}

describe('SessionView', () => {
  it('shows the session title', () => {
    render(<SessionView session={session} onPress={vi.fn()} onStop={vi.fn()} />)
    expect(screen.getByText(/NES — session abcdef12/)).toBeTruthy()
  })

  it('forwards a gamepad press', () => {
    const onPress = vi.fn()
    render(<SessionView session={session} onPress={onPress} onStop={vi.fn()} />)
    fireEvent.pointerDown(screen.getByText('a'))
    expect(onPress).toHaveBeenCalledWith('a', true)
  })

  it('calls onStop when Stop session is clicked', () => {
    const onStop = vi.fn()
    render(<SessionView session={session} onPress={vi.fn()} onStop={onStop} />)
    fireEvent.click(screen.getByText('Stop session'))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
