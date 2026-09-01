import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const nerdMode = vi.hoisted(() => ({
  useNerdMode: vi.fn(() => ({ isOpen: false })),
}))
const nav = vi.hoisted(() => ({
  push: vi.fn(),
  params: {} as Record<string, unknown>,
}))

vi.mock('@/components/nerd-mode-ide', () => nerdMode)
vi.mock('next/navigation', () => ({
  useRouter: () => nav,
  useParams: () => nav.params,
}))

import { useGodPanelState } from './use-god-panel-state'

beforeEach(() => {
  vi.clearAllMocks()
  nav.params = { tenantSlug: 'acme' }
})

describe('useGodPanelState', () => {
  it('resolves activeTab from the id, defaulting to 0 for an unknown one', () => {
    const { result } = renderHook(() => useGodPanelState('schemas'))
    expect(result.current.activeTabConfig.id).toBe('schemas')

    const fallback = renderHook(() => useGodPanelState('does-not-exist'))
    expect(fallback.result.current.activeTab).toBe(0)
    expect(fallback.result.current.activeTabConfig.id).toBe('overview')
  })

  it('builds tab hrefs scoped to the route tenant', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    expect(result.current.tabHref('plan')).toContain('acme')
    expect(result.current.tabHref('plan')).toContain('plan')
  })

  it('openTabById navigates only to a real tab', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    act(() => result.current.openTabById('plan'))
    expect(nav.push).toHaveBeenCalledWith(
      expect.stringContaining('plan')
    )

    nav.push.mockClear()
    act(() => result.current.openTabById('not-a-tab'))
    expect(nav.push).not.toHaveBeenCalled()
  })

  it('preview routes each level to its public page', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    act(() => result.current.preview(1))
    expect(nav.push).toHaveBeenLastCalledWith('/')
    act(() => result.current.preview(2))
    expect(nav.push).toHaveBeenLastCalledWith('/profile')
    act(() => result.current.preview(3))
    expect(nav.push).toHaveBeenLastCalledWith('/admin')
  })

  it('starts on the first walk-me step with the guide closed', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    expect(result.current.guideOpen).toBe(false)
    expect(result.current.guideStep).toBe(0)
    expect(result.current.currentStep?.tabId).toBe('overview')
  })

  it('setGuideOpen opens and closes the guide', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    act(() => result.current.setGuideOpen(true))
    expect(result.current.guideOpen).toBe(true)
  })

  it('moveGuide advances the step and opens that step\'s tab', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    act(() => result.current.moveGuide(1))
    expect(result.current.guideStep).toBe(1)
    expect(result.current.currentStep?.tabId).toBe('plan')
    expect(nav.push).toHaveBeenCalledWith(
      expect.stringContaining('plan')
    )
  })

  it('moveGuide past the last step leaves currentStep undefined', () => {
    const { result } = renderHook(() => useGodPanelState('overview'))
    act(() => result.current.moveGuide(9999))
    expect(result.current.currentStep).toBeUndefined()
  })

  it('exposes the nerd-mode state unchanged', () => {
    nerdMode.useNerdMode.mockReturnValue({ isOpen: true })
    const { result } = renderHook(() => useGodPanelState('overview'))
    expect(result.current.nerd).toEqual({ isOpen: true })
  })
})
