import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const retro = vi.hoisted(() => ({
  session: null as {
    id: string
    system: string
    romPath: string
    streamUrl: string
    startedAt: string
  } | null,
  loading: false,
  error: null as string | null,
  start: vi.fn(async () => {}),
  stop: vi.fn(async () => {}),
  sendInput: vi.fn(async () => {}),
}))

vi.mock('@/hooks/useRetroSession', () => ({
  useRetroSession: () => retro,
}))

import { RetroLauncher } from './RetroLauncher'

describe('RetroLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    retro.session = null
    retro.loading = false
    retro.error = null
  })

  it('shows the launch form with no session', () => {
    render(<RetroLauncher />)
    expect(screen.getByText('Select system')).toBeTruthy()
  })

  it('shows the session view once a session exists', () => {
    retro.session = {
      id: 'abc',
      system: 'nes',
      romPath: '/x.nes',
      streamUrl: 'https://x',
      startedAt: '2026-01-01',
    }
    render(<RetroLauncher />)
    expect(screen.getByText('Stop session')).toBeTruthy()
  })

  it('stops the session on click', () => {
    retro.session = {
      id: 'abc',
      system: 'nes',
      romPath: '/x.nes',
      streamUrl: 'https://x',
      startedAt: '2026-01-01',
    }
    render(<RetroLauncher />)
    fireEvent.click(screen.getByText('Stop session'))
    expect(retro.stop).toHaveBeenCalledOnce()
  })
})
