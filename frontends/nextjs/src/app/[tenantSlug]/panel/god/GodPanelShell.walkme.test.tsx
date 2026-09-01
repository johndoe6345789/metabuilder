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

// Split out of GodPanelShell.test.tsx to stay under the 80-line file limit.
describe('GodPanelShell walk-me open/close wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is open only when guideOpen and currentStep are both set', () => {
    godStateHook.useGodPanelState.mockReturnValue(
      makeGodState({ guideOpen: true, currentStep: WALK_ME_STEPS[0] })
    )
    const { rerender } = render(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('walkme-open').textContent).toBe('true')

    godStateHook.useGodPanelState.mockReturnValue(
      makeGodState({ guideOpen: true, currentStep: undefined })
    )
    rerender(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('walkme-open').textContent).toBe('false')

    godStateHook.useGodPanelState.mockReturnValue(
      makeGodState({ guideOpen: false, currentStep: WALK_ME_STEPS[0] })
    )
    rerender(<GodPanelShell activeTabId="overview" />)
    expect(screen.getByTestId('walkme-open').textContent).toBe('false')
  })

  it('onClose closes the guide', () => {
    const state = makeGodState({ guideOpen: true })
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('close-walkme'))
    expect(state.setGuideOpen).toHaveBeenCalledWith(false)
  })

  it('onSelectStep forwards the chosen index directly', () => {
    const state = makeGodState()
    godStateHook.useGodPanelState.mockReturnValue(state)
    render(<GodPanelShell activeTabId="overview" />)
    fireEvent.click(screen.getByText('select-walkme'))
    expect(state.moveGuide).toHaveBeenLastCalledWith(2)
  })
})
