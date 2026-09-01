import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: ({
    minLevel,
    levelName,
    children,
  }: {
    minLevel: number
    levelName?: string
    children: React.ReactNode
  }) => (
    <div data-testid="gate" data-level={minLevel} data-name={levelName}>
      {children}
    </div>
  ),
}))
vi.mock('./GodPanelShell', () => ({
  GodPanelShell: ({ activeTabId }: { activeTabId: string }) => (
    <div data-testid="shell" data-tab={activeTabId}>
      god-panel-shell
    </div>
  ),
}))

import GodPanelPage from './page'

describe('GodPanelPage', () => {
  it('gates for God level 4', () => {
    render(<GodPanelPage />)
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('4')
    expect(gate.getAttribute('data-name')).toBe('God')
  })

  it('renders GodPanelShell on the default tab', () => {
    render(<GodPanelPage />)
    const shell = screen.getByTestId('shell')
    expect(shell.getAttribute('data-tab')).toBe('overview')
  })
})
