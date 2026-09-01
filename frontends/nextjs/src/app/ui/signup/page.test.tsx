import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const signup = vi.hoisted(() => ({
  useSignup: vi.fn(),
}))
vi.mock('./use-signup', () => signup)

import SignupPage from './page'

function baseForm(over: Record<string, unknown> = {}) {
  return {
    community: '',
    name: '',
    email: '',
    password: '',
    tier: 'creator',
    error: '',
    loading: false,
    canSubmit: true,
    submit: vi.fn(async () => undefined),
    setCommunity: vi.fn(),
    setName: vi.fn(),
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    setTier: vi.fn(),
    ...over,
  }
}

describe('SignupPage', () => {
  it('renders the heading and enabled submit button', () => {
    signup.useSignup.mockReturnValue(baseForm())
    render(<SignupPage />)
    expect(screen.getByText('Create your community')).toBeTruthy()
    const button = screen.getByRole('button', { name: 'Start free trial' })
    expect((button as HTMLButtonElement).disabled).toBe(false)
  })

  it('shows the loading label and disables submit while loading', () => {
    signup.useSignup.mockReturnValue(baseForm({ loading: true }))
    render(<SignupPage />)
    expect(screen.getByText('Creating your platform…')).toBeTruthy()
  })

  it('disables submit when canSubmit is false', () => {
    signup.useSignup.mockReturnValue(baseForm({ canSubmit: false }))
    render(<SignupPage />)
    const button = screen.getByRole('button', { name: 'Start free trial' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows an error message when present', () => {
    signup.useSignup.mockReturnValue(
      baseForm({ error: 'Community name taken' })
    )
    render(<SignupPage />)
    expect(screen.getByText('Community name taken')).toBeTruthy()
  })

  it('calls submit on form submission without a page reload', () => {
    const form = baseForm()
    signup.useSignup.mockReturnValue(form)
    const { container } = render(<SignupPage />)
    const formEl = container.querySelector('form')
    expect(formEl).toBeTruthy()
    fireEvent.submit(formEl as HTMLFormElement)
    expect(form.submit).toHaveBeenCalled()
  })
})
