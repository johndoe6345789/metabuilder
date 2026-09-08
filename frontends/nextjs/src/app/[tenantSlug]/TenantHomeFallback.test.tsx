import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({ useRouter: vi.fn() }))
vi.mock('next/navigation', () => nav)

const auth = vi.hoisted(() => ({ useAuthContext: vi.fn() }))
vi.mock(
  '@/app/_components/auth-provider/auth-provider-component',
  () => auth
)

vi.mock('@/components/workspace/WorkspacePageSlot', () => ({
  WorkspacePageSlot: (props: {
    tenant: string
    path: string
    children: React.ReactNode
  }) => (
    <div data-testid="slot">
      <span data-testid="slot-tenant">{props.tenant}</span>
      <span data-testid="slot-path">{props.path}</span>
      {props.children}
    </div>
  ),
}))

import { TenantHomeFallback } from './TenantHomeFallback'

const replace = vi.fn()

const viewer = (isAuthenticated: boolean, isLoading = false) => {
  auth.useAuthContext.mockReturnValue({ isAuthenticated, isLoading })
}

beforeEach(() => {
  vi.clearAllMocks()
  nav.useRouter.mockReturnValue({ replace })
  viewer(false)
})

describe('TenantHomeFallback', () => {
  it('asks the slot for this tenant home page', () => {
    render(<TenantHomeFallback tenant="acme" />)
    expect(screen.getByTestId('slot-tenant').textContent).toBe('acme')
    expect(screen.getByTestId('slot-path').textContent).toBe('/')
  })
})

/**
 * The redirect into the panel used to be unconditional, so an anonymous
 * visitor to a community that had not published yet was bounced there,
 * met LevelGate, and was shown "Authentication Required". The founder's
 * public URL answered the world with a login prompt -- and the founder
 * could not fix it, because publishing the page is what would have
 * stopped it.
 */
describe('a community with nothing published at "/"', () => {
  it('does not send a stranger to the sign-in wall', () => {
    render(<TenantHomeFallback tenant="acme" />)

    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByText('Nothing here yet')).toBeTruthy()
  })

  it('sends the founder to the panel, where they can publish one', () => {
    viewer(true)
    render(<TenantHomeFallback tenant="acme" />)

    expect(replace).toHaveBeenCalledWith('/acme/panel')
  })

  // Neither answer is right until auth has said which visitor this is.
  it('shows nothing while it is still working out who is looking', () => {
    viewer(false, true)
    render(<TenantHomeFallback tenant="acme" />)

    expect(replace).not.toHaveBeenCalled()
    expect(screen.queryByText('Nothing here yet')).toBeNull()
  })
})
