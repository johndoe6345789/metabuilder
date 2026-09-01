import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { WALK_ME_STEPS } from './tabs/god-panel-config'
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

// Split out of GodPanelShell.walkme.test.tsx to stay under the 80-line
// file limit. Covers the Math.max/Math.min clamping in onBack/onNext.
describe('GodPanelShell walk-me back/next clamping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('onBack clamps at 0 and steps back by one otherwise', () => {
    const state = makeGodState({ guideStep: 0 })
    godStateHook.useGodPanelState.mockReturnValue(state)
    const { rerender } = render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('back-walkme'))
    expect(state.moveGuide).toHaveBeenLastCalledWith(0)

    const state2 = makeGodState({ guideStep: 2 })
    godStateHook.useGodPanelState.mockReturnValue(state2)
    rerender(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('back-walkme'))
    expect(state2.moveGuide).toHaveBeenLastCalledWith(1)
  })

  it('onNext clamps at the last step, steps forward by one otherwise', () => {
    const lastIndex = WALK_ME_STEPS.length - 1
    const state = makeGodState({ guideStep: lastIndex })
    godStateHook.useGodPanelState.mockReturnValue(state)
    const { rerender } = render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('next-walkme'))
    expect(state.moveGuide).toHaveBeenLastCalledWith(lastIndex)

    const state2 = makeGodState({ guideStep: 0 })
    godStateHook.useGodPanelState.mockReturnValue(state2)
    rerender(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('next-walkme'))
    expect(state2.moveGuide).toHaveBeenLastCalledWith(1)
  })
})
