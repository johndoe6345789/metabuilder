import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { nav, jsonResponse } from './page-test-mocks'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.replace }),
}))

vi.mock('@/components/WelcomePage', () => ({
  WelcomePage: () => <div data-testid="welcome" />,
}))

import RootPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RootPage', () => {
  it('renders nothing before the config fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = render(<RootPage />)
    expect(container.firstChild).toBeNull()
  })

  it('redirects to /login when the home route requires auth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse([
            { path: '/', isPublished: true, requiresAuth: true },
          ])
        )
      )
    )
    render(<RootPage />)
    await waitFor(() => {
      expect(nav.replace).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByTestId('welcome')).toBeNull()
  })

  // DBAL routes by entity name and only checks the package for shape,
  // so this matches the twenty other call sites rather than standing
  // alone as 'access' and reading as though one must be wrong.
  it('queries the DBAL core/PageConfig endpoint', () => {
    const fetchMock = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    render(<RootPage />)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/system/core/PageConfig'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })
})
