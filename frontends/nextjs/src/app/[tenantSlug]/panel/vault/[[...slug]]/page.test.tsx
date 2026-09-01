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
vi.mock('../VaultShell', () => ({
  VaultShell: () => <div>vault-shell</div>,
}))

import VaultRoutePage from './page'

describe('VaultRoutePage', () => {
  it('publishes at /vault and gates for User level 1', () => {
    render(<VaultRoutePage />)
    const slot = screen.getByTestId('slot')
    expect(slot.getAttribute('data-path')).toBe('/vault')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders VaultShell behind the gate', () => {
    render(<VaultRoutePage />)
    expect(screen.getByText('vault-shell')).toBeTruthy()
  })
})
