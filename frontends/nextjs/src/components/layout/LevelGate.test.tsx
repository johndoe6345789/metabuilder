import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))
const push = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { asUser, authValue } from '@/test/auth-harness'
import { LevelGate, type LevelGateProps } from './LevelGate'

const renderGate = (props: Omit<LevelGateProps, 'children'>) =>
  render(
    <LevelGate {...props}>
      <div>secret</div>
    </LevelGate>
  )

describe('LevelGate', () => {
  it('renders children when the user meets the level', () => {
    auth.value = authValue(asUser({ role: 'admin' }))
    renderGate({ minLevel: 1 })
    expect(screen.getByText('secret')).toBeTruthy()
  })

  it('shows a sign-in prompt when signed out', () => {
    auth.value = authValue(null)
    renderGate({ minLevel: 1 })
    expect(screen.getByText('Authentication Required')).toBeTruthy()
  })

  it('the sign-in button navigates to /login', () => {
    auth.value = authValue(null)
    renderGate({ minLevel: 1 })
    screen.getByText('Sign In').click()
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('renders nothing when signed out and silent', () => {
    auth.value = authValue(null)
    const { container } = renderGate({ minLevel: 1, silent: true })
    expect(container.firstChild).toBeNull()
  })

  it('shows access denied when signed in but under-levelled', () => {
    auth.value = authValue(asUser({ role: 'user' }))
    renderGate({ minLevel: 4, levelName: 'God' })
    expect(screen.getByText('Access Denied')).toBeTruthy()
    expect(
      screen.getByText('God access (Level 4) is required to view this page.')
    ).toBeTruthy()
  })

  it('uses a generic message when levelName is not given', () => {
    auth.value = authValue(asUser({ role: 'user' }))
    renderGate({ minLevel: 4 })
    expect(
      screen.getByText('Level 4 access is required to view this page.')
    ).toBeTruthy()
  })

  it('renders nothing when under-levelled and silent', () => {
    auth.value = authValue(asUser({ role: 'user' }))
    const { container } = renderGate({ minLevel: 4, silent: true })
    expect(container.firstChild).toBeNull()
  })
})
