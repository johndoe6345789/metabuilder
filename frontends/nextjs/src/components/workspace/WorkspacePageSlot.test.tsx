import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

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

const Registered = () => <div data-testid="registered-component" />

beforeEach(() => {
  vi.clearAllMocks()
  registry.resolveComponent.mockReturnValue(null)
})

describe('WorkspacePageSlot', () => {
  it('renders nothing while the slot is still loading', () => {
    slotData.fetchSlot.mockReturnValue(new Promise(() => undefined))
    const { container } = render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders the children once resolved with nothing published', async () => {
    slotData.fetchSlot.mockResolvedValue(null)
    render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    await waitFor(() => {
      expect(screen.getByText('fallback')).toBeTruthy()
    })
  })

  it('renders the registered component when one resolves', async () => {
    slotData.fetchSlot.mockResolvedValue({
      level: 2,
      component: 'dashboard_home',
      componentTree: null,
    })
    registry.resolveComponent.mockReturnValue(Registered)
    render(
      <WorkspacePageSlot path="/x">
        <p>fallback</p>
      </WorkspacePageSlot>
    )
    await waitFor(() => {
      expect(screen.getByTestId('registered-component')).toBeTruthy()
    })
    expect(screen.getByTestId('level-gate')).toBeTruthy()
    expect(screen.queryByText('fallback')).toBeNull()
  })

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
