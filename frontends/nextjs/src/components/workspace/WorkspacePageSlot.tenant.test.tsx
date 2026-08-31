import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

// Which tenant fetchSlot is called with -- split out of
// WorkspacePageSlot.test.tsx (which covers what the slot renders) to stay
// under the 80-line file limit.

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

describe('WorkspacePageSlot tenant routing', () => {
  it('defaults the tenant to system', () => {
    slotData.fetchSlot.mockReturnValue(new Promise(() => undefined))
    render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    expect(slotData.fetchSlot).toHaveBeenCalledWith('system', '/x')
  })

  it('passes an explicit tenant through', () => {
    slotData.fetchSlot.mockReturnValue(new Promise(() => undefined))
    render(
      <WorkspacePageSlot tenant="acme" path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    expect(slotData.fetchSlot).toHaveBeenCalledWith('acme', '/x')
  })
})
