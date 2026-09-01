import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const themeHook = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({
    mode: 'system' as const,
    resolvedMode: 'light' as const,
    setMode: vi.fn(),
  })),
}))
vi.mock('@/app/providers', () => themeHook)

import { ThemePanel } from './ThemePanel'

describe('ThemePanel', () => {
  it('shows the resolved mode and the stored preference', () => {
    render(<ThemePanel />)
    expect(screen.getByText('Current: light (preference: system)')).toBeTruthy()
  })

  it('renders the current preference chip filled, others outlined', () => {
    render(<ThemePanel />)
    // "filled" is m3 Chip's default (no extra class); "outlined" adds
    // chipOutlined -- the selected chip is the one without it.
    expect(screen.getByText('system').className).not.toContain('chipOutlined')
    expect(screen.getByText('light').className).toContain('chipOutlined')
    expect(screen.getByText('dark').className).toContain('chipOutlined')
  })

  it('calls setMode with the clicked option', () => {
    const setMode = vi.fn()
    themeHook.useTheme.mockReturnValue({
      mode: 'system',
      resolvedMode: 'light',
      setMode,
    })
    render(<ThemePanel />)
    fireEvent.click(screen.getByText('dark'))
    expect(setMode).toHaveBeenCalledWith('dark')
  })

  it('renders all three mode options', () => {
    render(<ThemePanel />)
    expect(screen.getByText('light')).toBeTruthy()
    expect(screen.getByText('dark')).toBeTruthy()
    expect(screen.getByText('system')).toBeTruthy()
  })
})
