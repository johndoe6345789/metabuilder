import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('RootPage rendering', () => {
  it('renders WelcomePage when the home route does not require auth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse([
            { path: '/', isPublished: true, requiresAuth: false },
          ])
        )
      )
    )
    render(<RootPage />)
    expect(await screen.findByTestId('welcome')).toBeTruthy()
    expect(nav.replace).not.toHaveBeenCalled()
  })

  it('renders WelcomePage when no published home route is found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse([{ path: '/other', isPublished: true }])
        )
      )
    )
    render(<RootPage />)
    expect(await screen.findByTestId('welcome')).toBeTruthy()
    expect(nav.replace).not.toHaveBeenCalled()
  })

  it('renders WelcomePage when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    render(<RootPage />)
    expect(await screen.findByTestId('welcome')).toBeTruthy()
  })

  it('renders WelcomePage when the fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))))
    render(<RootPage />)
    expect(await screen.findByTestId('welcome')).toBeTruthy()
  })
})
