// Shared mock components + fixtures for GodPanelShell's split test files.
// Kept as .ts (no JSX) so it falls outside the 80-line .tsx guardrail that
// forces GodPanelShell's own tests to be split across several files.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { GodPanelTab } from '@/lib/packages/navigation'
import { WALK_ME_STEPS } from './tabs/god-panel-config'

export const godStateHook = { useGodPanelState: vi.fn() }

export const TABS: GodPanelTab[] = [
  { id: 'overview' } as GodPanelTab,
  { id: 'plan' } as GodPanelTab,
]

export function makeGodState(overrides: Record<string, unknown> = {}) {
  return {
    tabs: TABS,
    activeTab: 0,
    activeTabConfig: TABS[0],
    tabHref: (id: string) => `/t/panel/god/${id}`,
    guideOpen: false,
    setGuideOpen: vi.fn(),
    guideStep: 0,
    currentStep: WALK_ME_STEPS[0],
    preview: vi.fn(),
    openTabById: vi.fn(),
    moveGuide: vi.fn(),
    nerd: { isOpen: false, toggle: vi.fn(), close: vi.fn() },
    ...overrides,
  }
}

type TopBarProps = {
  guideOpen: boolean
  nerdOpen: boolean
  onHome: () => void
  onPreview: (level: number) => void
  onToggleGuide: () => void
  onToggleNerd: () => void
}

export function mockTopBar(props: TopBarProps) {
  return createElement(
    'div',
    { 'data-testid': 'topbar' },
    createElement(
      'span',
      { 'data-testid': 'topbar-guideopen' },
      String(props.guideOpen)
    ),
    createElement(
      'span',
      { 'data-testid': 'topbar-nerdopen' },
      String(props.nerdOpen)
    ),
    createElement('button', { onClick: props.onHome }, 'home'),
    createElement(
      'button',
      { onClick: () => { props.onPreview(3); } },
      'preview'
    ),
    createElement(
      'button',
      { onClick: props.onToggleGuide },
      'toggle-guide'
    ),
    createElement(
      'button',
      { onClick: props.onToggleNerd },
      'toggle-nerd'
    )
  )
}

type TabNavProps = {
  tabs: readonly GodPanelTab[]
  activeTab: number
  tabHref: (id: string) => string
}

export function mockTabNav(props: TabNavProps) {
  return createElement(
    'div',
    { 'data-testid': 'tabnav' },
    createElement(
      'span',
      { 'data-testid': 'tabnav-count' },
      props.tabs.length
    ),
    createElement(
      'span',
      { 'data-testid': 'tabnav-active' },
      props.activeTab
    ),
    createElement(
      'span',
      { 'data-testid': 'tabnav-href' },
      props.tabHref('plan')
    )
  )
}

type ContextBarProps = { tab: GodPanelTab; onShowGuide: () => void }

export function mockContextBar(props: ContextBarProps) {
  return createElement(
    'div',
    { 'data-testid': 'contextbar' },
    createElement(
      'span',
      { 'data-testid': 'contextbar-tab' },
      props.tab.id
    ),
    createElement(
      'button',
      { onClick: props.onShowGuide },
      'show-guide'
    )
  )
}

type WalkMeProps = {
  open: boolean
  currentStep: number
  onClose: () => void
  onBack: () => void
  onNext: () => void
  onSelectStep: (index: number) => void
}

export function mockWalkMe(props: WalkMeProps) {
  return createElement(
    'div',
    { 'data-testid': 'walkme' },
    createElement(
      'span',
      { 'data-testid': 'walkme-open' },
      String(props.open)
    ),
    createElement(
      'span',
      { 'data-testid': 'walkme-step' },
      props.currentStep
    ),
    createElement('button', { onClick: props.onClose }, 'close-walkme'),
    createElement('button', { onClick: props.onBack }, 'back-walkme'),
    createElement('button', { onClick: props.onNext }, 'next-walkme'),
    createElement(
      'button',
      { onClick: () => { props.onSelectStep(2); } },
      'select-walkme'
    )
  )
}

type PanelsProps = { tabs: readonly GodPanelTab[]; activeTab: number }

export function mockPanels(props: PanelsProps) {
  return createElement(
    'div',
    { 'data-testid': 'panels' },
    createElement(
      'span',
      { 'data-testid': 'panels-count' },
      props.tabs.length
    ),
    createElement(
      'span',
      { 'data-testid': 'panels-active' },
      props.activeTab
    )
  )
}

export function mockNerdModeIde(props: { onClose: () => void }) {
  return createElement(
    'div',
    { 'data-testid': 'nerd-ide' },
    createElement('button', { onClick: props.onClose }, 'close-nerd')
  )
}
