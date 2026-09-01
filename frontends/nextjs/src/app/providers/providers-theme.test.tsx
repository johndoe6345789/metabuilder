import { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { persistGateMock, themeMock } from './providers-test-mocks'
import { ThemeContext } from './theme-context'

import { Providers } from './providers-component'

beforeEach(() => {
  vi.clearAllMocks()
  persistGateMock.usePersistGate.mockReturnValue(true)
  themeMock.resolveTenantTheme.mockResolvedValue({ light: {}, dark: {} })
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  )
})

describe('Providers theme resolution', () => {
  it('defaults to the system theme, resolved from matchMedia', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    render(<Providers>{null}</Providers>)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('resolves system to light when matchMedia reports no preference', async () => {
    render(<Providers>{null}</Providers>)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light')
    })
  })

  it('applies the tenant theme for the resolved mode once loaded', async () => {
    render(<Providers>{null}</Providers>)

    await waitFor(() => {
      expect(themeMock.applyTenantTheme).toHaveBeenCalledWith(
        { light: {}, dark: {} },
        'light'
      )
    })
  })

  it('does not throw when resolveTenantTheme rejects', async () => {
    themeMock.resolveTenantTheme.mockRejectedValue(new Error('offline'))
    expect(() => render(<Providers>{null}</Providers>)).not.toThrow()
    await waitFor(() => {
      expect(themeMock.resolveTenantTheme).toHaveBeenCalled()
    })
  })

  it('toggleTheme cycles light -> dark -> system -> light', () => {
    function Reader() {
      const ctx = useContext(ThemeContext)
      return (
        <button data-testid="toggle" onClick={ctx?.toggleTheme}>
          {ctx?.mode}
        </button>
      )
    }
    render(
      <Providers>
        <Reader />
      </Providers>
    )
    const button = screen.getByTestId('toggle')
    expect(button.textContent).toBe('system')

    act(() => button.click())
    expect(button.textContent).toBe('light')

    act(() => button.click())
    expect(button.textContent).toBe('dark')

    act(() => button.click())
    expect(button.textContent).toBe('system')
  })
})
