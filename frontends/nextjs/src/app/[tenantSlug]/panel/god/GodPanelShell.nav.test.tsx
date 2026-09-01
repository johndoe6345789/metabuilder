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

// Split out of GodPanelShell.test.tsx (which covers the top bar) to stay
// under the 80-line file limit.
describe('GodPanelShell tab nav and context bar wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('threads tabs, activeTab and tabHref to the tab nav', () => {
    const state = makeGodState({ activeTab: 1 })
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="plan" />)
    expect(screen.getByTestId('tabnav-count').textContent).toBe('2')
    expect(screen.getByTestId('tabnav-active').textContent).toBe('1')
    expect(screen.getByTestId('tabnav-href').textContent).toBe(
      '/t/panel/god/plan'
    )
  })

  it('threads activeTabConfig to the context bar; onShowGuide opens it', () => {
    const state = makeGodState()
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('contextbar-tab').textContent).toBe(
      'overview'
    )
    fireEvent.click(screen.getByText('show-guide'))
    expect(state.setGuideOpen).toHaveBeenCalledWith(true)
  })
})
