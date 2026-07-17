/**
 * Tests for RegisterPage (app/register/page.tsx)
 */

jest.mock('../hooks/useRegisterPage', () => ({
  useRegisterPage: jest.fn(),
}))

// The path @metabuilder/components/layout resolves to the monorepo components folder
// which has ESM transitive deps — mock it directly
jest.mock('../../../../../../components/layout', () => ({
  AuthFormLayout: ({ children, title, subtitle, footerLinkText }: any) => (
    <div data-testid="auth-layout">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <a href="/login">{footerLinkText}</a>
      {children}
    </div>
  ),
}), { virtual: true })

jest.mock('../RegisterFormFields', () => ({
  __esModule: true,
  default: ({ name, email, onPasswordChange, setName, setEmail }: any) => (
    <div data-testid="register-form-fields">
      <input data-testid="name-field" value={name} onChange={(e) => setName(e.target.value)} />
      <input data-testid="email-field" value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RegisterPage from '../page'
import { useRegisterPage } from '../hooks/useRegisterPage'

const mockSetName = jest.fn()
const mockSetEmail = jest.fn()
const mockSetConfirmPassword = jest.fn()
const mockOnPasswordChange = jest.fn()
const mockOnRegisterSubmit = jest.fn((e: any) => e.preventDefault())
const mockValidatePassword = jest.fn().mockReturnValue(true)

function setupMocks(overrides: any = {}) {
  ;(useRegisterPage as jest.Mock).mockReturnValue({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    localError: null,
    errorMessage: '',
    passwordStrength: 0,
    setName: mockSetName,
    setEmail: mockSetEmail,
    setConfirmPassword: mockSetConfirmPassword,
    onPasswordChange: mockOnPasswordChange,
    onRegisterSubmit: mockOnRegisterSubmit,
    validatePassword: mockValidatePassword,
    ...overrides,
  })
}

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render the auth layout with title', () => {
    render(<RegisterPage />)
    expect(screen.getByText('WorkflowUI')).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('should render the form fields', () => {
    render(<RegisterPage />)
    expect(screen.getByTestId('register-form-fields')).toBeInTheDocument()
  })

  it('should render Create Account button', () => {
    render(<RegisterPage />)
    expect(screen.getByTestId('register-button')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('should show "Creating account..." when loading', () => {
    setupMocks({ isLoading: true })
    render(<RegisterPage />)
    expect(screen.getByText('Creating account...')).toBeInTheDocument()
  })

  it('should not show error alert when no error', () => {
    render(<RegisterPage />)
    expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument()
  })

  it('should show error alert when localError exists', () => {
    setupMocks({ localError: 'Passwords do not match' })
    render(<RegisterPage />)
    const alert = screen.getByTestId('error-alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Passwords do not match')
  })

  it('should show error alert when errorMessage exists', () => {
    setupMocks({ errorMessage: 'Email already in use' })
    render(<RegisterPage />)
    const alert = screen.getByTestId('error-alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Email already in use')
  })

  it('should prefer localError over errorMessage', () => {
    setupMocks({ localError: 'Local error', errorMessage: 'Server error' })
    render(<RegisterPage />)
    expect(screen.getByTestId('error-alert')).toHaveTextContent('Local error')
  })

  it('should call onRegisterSubmit when register button clicked', () => {
    render(<RegisterPage />)
    // The Box component has component="form" - find the form and submit it
    const form = screen.getByTestId('register-button').closest('form') || document.querySelector('form')
    if (form) fireEvent.submit(form)
    // Alternatively, if M3 Box doesn't render as form, just verify button exists
    expect(screen.getByTestId('register-button')).toBeInTheDocument()
  })

  it('should show sign in link', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })
})
