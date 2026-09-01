import { Component, Suspense, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'

const navigation = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('next/navigation', () => navigation)

vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: ({
    minLevel,
    levelName,
    children,
  }: {
    minLevel: number
    levelName?: string
    children: React.ReactNode
  }) => (
    <div data-testid="gate" data-level={minLevel} data-name={levelName}>
      {children}
    </div>
  ),
}))
vi.mock('../GodPanelShell', () => ({
  GodPanelShell: ({ activeTabId }: { activeTabId: string }) => (
    <div data-testid="shell" data-tab={activeTabId}>
      god-panel-shell
    </div>
  ),
}))

import GodPanelTabPage from './page'

/** Catches the render-time throw from the mocked notFound(). */
class CaughtError extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state: { message: string | null } = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  render() {
    if (this.state.message !== null) {
      return <div data-testid="caught-error">{this.state.message}</div>
    }
    return this.props.children
  }
}

async function renderTab(tab: string) {
  await act(async () => {
    render(
      <CaughtError>
        <Suspense fallback={<div>loading</div>}>
          <GodPanelTabPage params={Promise.resolve({ tab })} />
        </Suspense>
      </CaughtError>
    )
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GodPanelTabPage', () => {
  it('gates for God level 4 and renders the requested tab', async () => {
    await renderTab('workflows')
    const shell = await screen.findByTestId('shell')
    expect(shell.getAttribute('data-tab')).toBe('workflows')
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('4')
    expect(gate.getAttribute('data-name')).toBe('God')
  })

  it('calls notFound for an unknown tab id', async () => {
    await renderTab('not-a-real-tab')
    const caught = await screen.findByTestId('caught-error')
    expect(caught.textContent).toBe('NEXT_NOT_FOUND')
    expect(navigation.notFound).toHaveBeenCalled()
  })
})
