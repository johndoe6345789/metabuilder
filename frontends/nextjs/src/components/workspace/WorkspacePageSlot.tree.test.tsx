import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// The component-tree and no-renderable-content resolution branches -- split
// out of WorkspacePageSlot.test.tsx (which covers the plain-component
// branches) to stay under the 80-line file limit.

const slotData = vi.hoisted(() => ({ fetchSlot: vi.fn() }))
vi.mock('./workspace-slot-data', () => slotData)

const registry = vi.hoisted(() => ({ resolveComponent: vi.fn(() => null) }))
vi.mock('@/lib/packages/component-registry', () => registry)

vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="level-gate">{children}</div>
  ),
}))

vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: () => <div data-testid="ui-page-renderer" />,
}))

import { WorkspacePageSlot } from './WorkspacePageSlot'

beforeEach(() => {
  vi.clearAllMocks()
  registry.resolveComponent.mockReturnValue(null)
})

describe('WorkspacePageSlot component tree', () => {
  it('renders the component tree when no component resolves', async () => {
    slotData.fetchSlot.mockResolvedValue({
      level: 1,
      component: null,
      componentTree: { id: 'root' },
    })
    render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    await waitFor(() => {
      expect(screen.getByTestId('ui-page-renderer')).toBeTruthy()
    })
  })

  // A row that names neither -- fetchSlot's own contract says this can't
  // happen, but the view falls back safely if it ever does.
  it('falls back to children when the slot resolves nothing renderable', async () => {
    slotData.fetchSlot.mockResolvedValue({
      level: 1,
      component: null,
      componentTree: null,
    })
    render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    await waitFor(() => {
      expect(screen.getByText('fallback')).toBeTruthy()
    })
  })
})
