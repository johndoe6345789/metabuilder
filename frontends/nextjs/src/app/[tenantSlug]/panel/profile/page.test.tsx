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
vi.mock('./ProfileContent', () => ({
  ProfileContent: () => <div>profile-content</div>,
}))

import ProfilePage from './page'

describe('ProfilePage', () => {
  it('publishes at /profile and gates for User level 1', () => {
    render(<ProfilePage />)
    const slot = screen.getByTestId('slot')
    expect(slot.getAttribute('data-path')).toBe('/profile')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders ProfileContent behind the gate', () => {
    render(<ProfilePage />)
    expect(screen.getByText('profile-content')).toBeTruthy()
  })
})
