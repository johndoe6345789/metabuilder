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

  it('queries the DBAL access/PageConfig endpoint', () => {
    const fetchMock = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    render(<RootPage />)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/system/access/PageConfig'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })
})
