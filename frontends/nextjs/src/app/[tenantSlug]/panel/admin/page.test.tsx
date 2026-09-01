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
vi.mock('@/components/workspace/WorkspacePageSlot', () => ({
  WorkspacePageSlot: ({
    path,
    children,
  }: {
    path: string
    children: React.ReactNode
  }) => (
    <div data-testid="slot" data-path={path}>
      {children}
    </div>
  ),
}))
vi.mock('./AdminContent', () => ({
  AdminContent: () => <div>admin-content</div>,
}))

import AdminPage from './page'

describe('AdminPage', () => {
  it('publishes at /admin/users and gates for Admin level 3', () => {
    render(<AdminPage />)
    const slot = screen.getByTestId('slot')
    expect(slot.getAttribute('data-path')).toBe('/admin/users')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('3')
    expect(gate.getAttribute('data-name')).toBe('Admin')
  })

  it('renders AdminContent behind the gate', () => {
    render(<AdminPage />)
    expect(screen.getByText('admin-content')).toBeTruthy()
  })
})
