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
vi.mock('./panels/ThemePanel', () => ({
  ThemePanel: () => <div>theme-panel</div>,
}))
vi.mock('./panels/AccountPanel', () => ({
  AccountPanel: () => <div>account-panel</div>,
}))
vi.mock('./panels/DbalPanel', () => ({
  DbalPanel: () => <div>dbal-panel</div>,
}))

import SettingsPage from './page'

describe('SettingsPage', () => {
  it('gates for User level 1', () => {
    render(<SettingsPage />)
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders all three settings panels', () => {
    render(<SettingsPage />)
    expect(screen.getByText('theme-panel')).toBeTruthy()
    expect(screen.getByText('account-panel')).toBeTruthy()
    expect(screen.getByText('dbal-panel')).toBeTruthy()
  })
})
