import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  godStateHook,
  makeGodState,
  mockTopBar,
  mockTabNav,
  mockContextBar,
  mockWalkMe,
  mockPanels,
  mockNerdModeIde,
} from './god-panel-shell-test-mocks'

vi.mock('./use-god-panel-state', () => godStateHook)
vi.mock('./GodPanelTopBar', () => ({ GodPanelTopBar: mockTopBar }))
vi.mock('./GodPanelTabNav', () => ({ GodPanelTabNav: mockTabNav }))
vi.mock('./GodPanelContextBar', () => ({
  GodPanelContextBar: mockContextBar,
}))
vi.mock('./GodPanelWalkMe', () => ({ GodPanelWalkMe: mockWalkMe }))
vi.mock('./GodPanelPanels', () => ({ GodPanelPanels: mockPanels }))
vi.mock('@/components/nerd-mode-ide', () => ({
  NerdModeIde: mockNerdModeIde,
}))

import { GodPanelShell } from './GodPanelShell'

// Split out of GodPanelShell.test.tsx to stay under the 80-line file limit.
describe('GodPanelShell panels and nerd mode wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('threads tabs and activeTab to the panels', () => {
    const state = makeGodState({ activeTab: 1 })
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="plan" />)
    expect(screen.getByTestId('panels-count').textContent).toBe('2')
    expect(screen.getByTestId('panels-active').textContent).toBe('1')
  })

  it('renders NerdModeIde only when nerd.isOpen, wired to nerd.close', () => {
    const closedState = makeGodState({
      nerd: { isOpen: false, toggle: vi.fn(), close: vi.fn() },
    })
    godStateHook.useGodPanelState.mockReturnValue(closedState)
    const { rerender } = render(<GodPanelShell activeTabId="overview" />)
    expect(screen.queryByTestId('nerd-ide')).toBeNull()

    const close = vi.fn()
    const openState = makeGodState({
      nerd: { isOpen: true, toggle: vi.fn(), close },
    })
    godStateHook.useGodPanelState.mockReturnValue(openState)
    rerender(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('nerd-ide')).toBeTruthy()
    fireEvent.click(screen.getByText('close-nerd'))
    expect(close).toHaveBeenCalledOnce()
  })
})
