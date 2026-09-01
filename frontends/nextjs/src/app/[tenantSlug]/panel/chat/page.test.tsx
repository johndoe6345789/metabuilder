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
vi.mock('./ChatContent', () => ({
  ChatContent: () => <div>chat-content</div>,
}))

import ChatPage from './page'

describe('ChatPage', () => {
  it('publishes at /irc and gates for User level 1', () => {
    render(<ChatPage />)
    const slot = screen.getByTestId('slot')
    expect(slot.getAttribute('data-path')).toBe('/irc')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders ChatContent behind the gate', () => {
    render(<ChatPage />)
    expect(screen.getByText('chat-content')).toBeTruthy()
  })
})
