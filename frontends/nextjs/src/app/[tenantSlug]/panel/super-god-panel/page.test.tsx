import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

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
vi.mock('./tabs/TenantsTab', () => ({
  TenantsTab: () => <div>tenants-tab</div>,
}))
vi.mock('./tabs/GodUsersTab', () => ({
  GodUsersTab: () => <div>god-users-tab</div>,
}))
vi.mock('./tabs/PowerTransferTab', () => ({
  PowerTransferTab: () => <div>power-transfer-tab</div>,
}))
vi.mock('./tabs/PreviewLevelsTab', () => ({
  PreviewLevelsTab: () => <div>preview-levels-tab</div>,
}))

import SuperGodPage from './page'

describe('SuperGodPage', () => {
  it('gates for Super God level 5', () => {
    render(<SuperGodPage />)
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('5')
    expect(gate.getAttribute('data-name')).toBe('Super God')
  })

  it('shows the Tenants tab by default', () => {
    render(<SuperGodPage />)
    expect(screen.getByText('tenants-tab')).toBeTruthy()
  })

  it('switches to God Users when its tab is clicked', () => {
    render(<SuperGodPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'God Users' }))
    expect(screen.getByText('god-users-tab')).toBeTruthy()
  })

  it('switches to Power Transfer when its tab is clicked', () => {
    render(<SuperGodPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Power Transfer' }))
    expect(screen.getByText('power-transfer-tab')).toBeTruthy()
  })

  it('switches to Preview Levels when its tab is clicked', () => {
    render(<SuperGodPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Preview Levels' }))
    expect(screen.getByText('preview-levels-tab')).toBeTruthy()
  })
})
