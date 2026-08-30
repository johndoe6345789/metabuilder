import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { LaunchForm } from './LaunchForm'

const base = {
  system: null,
  onSystemChange: vi.fn(),
  romUrl: '',
  onRomUrlChange: vi.fn(),
  loading: false,
  error: null,
  onLaunch: vi.fn(),
} as const

describe('LaunchForm', () => {
  it('disables Launch with no system or url chosen', () => {
    render(<LaunchForm {...base} />)
    const button = screen.getByText(/Launch/).closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('enables Launch once a system and url are set', () => {
    render(<LaunchForm {...base} system="nes" romUrl="http://x/game.nes" />)
    const button = screen.getByText('Launch NES game').closest('button')
    expect(button?.disabled).toBe(false)
  })

  it('shows the loading label while launching', () => {
    render(<LaunchForm {...base} loading />)
    expect(screen.getByText('Launching…')).toBeTruthy()
  })

  it('shows an error message when given one', () => {
    render(<LaunchForm {...base} error="Failed to start" />)
    expect(screen.getByText('Failed to start')).toBeTruthy()
  })

  it('reports url changes', () => {
    const onRomUrlChange = vi.fn()
    render(<LaunchForm {...base} onRomUrlChange={onRomUrlChange} />)
    fireEvent.change(screen.getByPlaceholderText(/games\/mario/), {
      target: { value: 'http://x/y.nes' },
    })
    expect(onRomUrlChange).toHaveBeenCalledWith('http://x/y.nes')
  })

  it('calls onLaunch when clicked', () => {
    const onLaunch = vi.fn()
    render(
      <LaunchForm
        {...base}
        system="nes"
        romUrl="http://x/game.nes"
        onLaunch={onLaunch}
      />
    )
    fireEvent.click(screen.getByText('Launch NES game'))
    expect(onLaunch).toHaveBeenCalledOnce()
  })
})
