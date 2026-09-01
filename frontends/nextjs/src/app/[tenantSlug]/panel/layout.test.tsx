import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/layout', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}))

import TenantPanelLayout from './layout'

describe('TenantPanelLayout', () => {
  it('wraps children in the AppShell chrome', () => {
    render(
      <TenantPanelLayout>
        <div>panel content</div>
      </TenantPanelLayout>
    )
    const shell = screen.getByTestId('app-shell')
    expect(shell).toBeTruthy()
    expect(screen.getByText('panel content')).toBeTruthy()
  })
})
