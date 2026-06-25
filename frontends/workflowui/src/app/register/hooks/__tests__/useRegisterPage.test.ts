/**
 * Tests for useRegisterPage hook
 */

jest.mock('@metabuilder/hooks', () => ({
  useAuthForm: jest.fn(),
  usePasswordValidation: jest.fn(),
  useRegisterLogic: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import {
  useAuthForm, usePasswordValidation, useRegisterLogic,
} from '@metabuilder/hooks'
import { useRegisterPage } from '../useRegisterPage'

const mockSetEmail = jest.fn()
const mockSetPassword = jest.fn()
const mockClearErrors = jest.fn()
const mockHandlePasswordChange = jest.fn()
const mockValidatePassword = jest.fn().mockReturnValue(true)
const mockHandleRegister = jest.fn().mockResolvedValue(undefined)

function setupMocks() {
  ;(useAuthForm as jest.Mock).mockReturnValue({
    email: 'test@example.com',
    password: 'password123',
    localError: null,
    isLoading: false,
    errorMessage: '',
    setEmail: mockSetEmail,
    setPassword: mockSetPassword,
    clearErrors: mockClearErrors,
  })

  ;(usePasswordValidation as jest.Mock).mockReturnValue({
    passwordStrength: 3,
    validatePassword: mockValidatePassword,
    handlePasswordChange: mockHandlePasswordChange,
  })

  ;(useRegisterLogic as jest.Mock).mockReturnValue({
    handleRegister: mockHandleRegister,
  })
}

describe('useRegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should initialize name as empty string', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.name).toBe('')
  })

  it('should initialize confirmPassword as empty string', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.confirmPassword).toBe('')
  })

  it('should return email from useAuthForm', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.email).toBe('test@example.com')
  })

  it('should return password from useAuthForm', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.password).toBe('password123')
  })

  it('should return isLoading from useAuthForm', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.isLoading).toBe(false)
  })

  it('should return passwordStrength from usePasswordValidation', () => {
    const { result } = renderHook(() => useRegisterPage())
    expect(result.current.passwordStrength).toBe(3)
  })

  it('should update name via setName', () => {
    const { result } = renderHook(() => useRegisterPage())
    act(() => { result.current.setName('John Doe') })
    expect(result.current.name).toBe('John Doe')
  })

  it('should update confirmPassword via setConfirmPassword', () => {
    const { result } = renderHook(() => useRegisterPage())
    act(() => { result.current.setConfirmPassword('secret123') })
    expect(result.current.confirmPassword).toBe('secret123')
  })

  it('onPasswordChange should call setPassword and handlePasswordChange', () => {
    const { result } = renderHook(() => useRegisterPage())
    act(() => { result.current.onPasswordChange('newpass') })
    expect(mockSetPassword).toHaveBeenCalledWith('newpass')
    expect(mockHandlePasswordChange).toHaveBeenCalledWith('newpass')
  })

  it('onRegisterSubmit should call clearErrors', async () => {
    const { result } = renderHook(() => useRegisterPage())
    const e = { preventDefault: jest.fn() }

    await act(async () => {
      await result.current.onRegisterSubmit(e as any)
    })

    expect(mockClearErrors).toHaveBeenCalled()
  })

  it('onRegisterSubmit should call handleRegister with form data', async () => {
    const { result } = renderHook(() => useRegisterPage())

    act(() => { result.current.setName('Jane') })
    act(() => { result.current.setConfirmPassword('pass123') })

    const e = { preventDefault: jest.fn() }
    await act(async () => {
      await result.current.onRegisterSubmit(e as any)
    })

    expect(mockHandleRegister).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'pass123',
    })
  })

  it('onRegisterSubmit should prevent default', async () => {
    const { result } = renderHook(() => useRegisterPage())
    const e = { preventDefault: jest.fn() }

    await act(async () => {
      await result.current.onRegisterSubmit(e as any)
    })

    expect(e.preventDefault).toHaveBeenCalled()
  })

  it('should handle handleRegister rejection gracefully', async () => {
    ;(useRegisterLogic as jest.Mock).mockReturnValue({
      handleRegister: jest.fn().mockRejectedValue(new Error('Auth error')),
    })

    const { result } = renderHook(() => useRegisterPage())
    const e = { preventDefault: jest.fn() }

    // Should not throw
    await act(async () => {
      await result.current.onRegisterSubmit(e as any)
    })
  })
})
