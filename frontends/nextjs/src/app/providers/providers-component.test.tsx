import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { persistGateMock, themeMock } from './providers-test-mocks'

import { Providers } from './providers-component'

beforeEach(() => {
  vi.clearAllMocks()
  persistGateMock.usePersistGate.mockReturnValue(true)
  themeMock.resolveTenantTheme.mockResolvedValue({ light: {}, dark: {} })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  )
})

describe('Providers', () => {
  it('renders children once the persist gate is rehydrated', () => {
    render(
      <Providers>
        <div data-testid="child">hi</div>
      </Providers>
    )
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('renders nothing under the gate while not yet rehydrated', () => {
    persistGateMock.usePersistGate.mockReturnValue(false)
    render(
      <Providers>
        <div data-testid="child">hi</div>
      </Providers>
    )
    expect(screen.queryByTestId('child')).toBeNull()
    // The rest of the shell (outside the gate) still renders.
    expect(screen.getByTestId('css-baseline')).toBeTruthy()
  })
})
