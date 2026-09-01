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
vi.mock('./CommentsContent', () => ({
  CommentsContent: () => <div>comments-content</div>,
}))

import CommentsPage from './page'

describe('CommentsPage', () => {
  it('publishes at /comments and gates for User level 1', () => {
    render(<CommentsPage />)
    const slot = screen.getByTestId('slot')
    expect(slot.getAttribute('data-path')).toBe('/comments')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('1')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('renders CommentsContent behind the gate', () => {
    render(<CommentsPage />)
    expect(screen.getByText('comments-content')).toBeTruthy()
  })
})
