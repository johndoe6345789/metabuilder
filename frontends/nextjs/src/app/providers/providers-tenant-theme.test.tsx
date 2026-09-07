import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { persistGateMock, themeMock } from './providers-test-mocks'

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

/**
 * A founder's brand colours live under their own tenant, and Providers is
 * the app-wide consumer that puts them on the page.
 *
 * Both the editor and this reader used to name the constant 'system', so a
 * founder's colours were saved into a tenant they do not own and read back
 * from that same one -- what a visitor to their site saw was whatever the
 * shared tenant had last been set to, never their own branding.
 */
describe('whose branding a visitor gets', () => {
  it('applies the branding of the site being visited', async () => {
    render(<Providers>{null}</Providers>)

    await waitFor(() => {
      expect(themeMock.resolveTenantTheme).toHaveBeenCalledWith('acme')
    })
  })
})
