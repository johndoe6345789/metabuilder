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
vi.mock('@/app/[tenantSlug]/panel/dashboard/DashboardContent', () => ({
  DashboardContent: () => <div>dashboard-content</div>,
}))

import PanelHome from './page'

describe('PanelHome', () => {
  it('gates for User level 1', () => {
    render(<PanelHome />)
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders DashboardContent behind the gate', () => {
    render(<PanelHome />)
    expect(screen.getByText('dashboard-content')).toBeTruthy()
  })
})
