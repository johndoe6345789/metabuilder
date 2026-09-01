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

describe('GodPanelShell top bar wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('threads guideOpen and nerd.isOpen into the top bar', () => {
    godStateHook.useGodPanelState.mockReturnValue(
      makeGodState({
        guideOpen: true,
        nerd: { isOpen: true, toggle: vi.fn(), close: vi.fn() },
      })
    )
    render(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('topbar-guideopen').textContent).toBe('true')
    expect(screen.getByTestId('topbar-nerdopen').textContent).toBe('true')
  })

  it('onHome calls preview(1), onPreview forwards the level directly', () => {
    const state = makeGodState()
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('home'))
    expect(state.preview).toHaveBeenLastCalledWith(1)
    fireEvent.click(screen.getByText('preview'))
    expect(state.preview).toHaveBeenLastCalledWith(3)
  })

  it('onToggleGuide passes a functional toggle to setGuideOpen', () => {
    const state = makeGodState()
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('toggle-guide'))
    expect(state.setGuideOpen).toHaveBeenCalledTimes(1)
    const updater = state.setGuideOpen.mock.calls[0][0] as (
      open: boolean
    ) => boolean
    expect(updater(true)).toBe(false)
    expect(updater(false)).toBe(true)
  })

  it('onToggleNerd is wired straight to nerd.toggle', () => {
    const state = makeGodState()
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('toggle-nerd'))
    expect(state.nerd.toggle).toHaveBeenCalledOnce()
  })
})
