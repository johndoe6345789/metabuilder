/**
 * Tests for useLoginPage hook
 */

import { renderHook, act } from '@testing-library/react';

const mockClearErrors = jest.fn();
const mockHandleLogin = jest.fn().mockResolvedValue(undefined);
const mockSetEmail = jest.fn();
const mockSetPassword = jest.fn();

jest.mock('../../../../hooks', () => ({
  useAuthForm: jest.fn(() => ({
    email: 'test@example.com',
    password: 'pass',
    localError: null,
    isLoading: false,
    errorMessage: null,
    setEmail: mockSetEmail,
    setPassword: mockSetPassword,
    clearErrors: mockClearErrors,
  })),
  useLoginLogic: jest.fn(() => ({
    handleLogin: mockHandleLogin,
  })),
}));

import { useLoginPage } from '../useLoginPage';

describe('useLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns email from useAuthForm', () => {
    const { result } = renderHook(() => useLoginPage());
    expect(result.current.email).toBe('test@example.com');
  });

  it('rememberMe defaults to false', () => {
    const { result } = renderHook(() => useLoginPage());
    expect(result.current.rememberMe).toBe(false);
  });

  it('useSalesforceStyle defaults to true', () => {
    const { result } = renderHook(() => useLoginPage());
    expect(result.current.useSalesforceStyle).toBe(true);
  });

  it('setRememberMe toggles rememberMe', () => {
    const { result } = renderHook(() => useLoginPage());
    act(() => {
      result.current.setRememberMe(true);
    });
    expect(result.current.rememberMe).toBe(true);
  });

  it('setUseSalesforceStyle toggles the style', () => {
    const { result } = renderHook(() => useLoginPage());
    act(() => {
      result.current.setUseSalesforceStyle(false);
    });
    expect(result.current.useSalesforceStyle).toBe(false);
  });

  it('onLoginSubmit calls clearErrors and handleLogin', async () => {
    const { result } = renderHook(() => useLoginPage());
    const fakeEvent = { preventDefault: jest.fn() } as any;
    await act(async () => {
      await result.current.onLoginSubmit(fakeEvent);
    });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(mockClearErrors).toHaveBeenCalled();
    expect(mockHandleLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass',
    });
  });

  it('onLoginSubmit does not throw when handleLogin rejects', async () => {
    mockHandleLogin.mockRejectedValueOnce(new Error('Auth failed'));
    const { result } = renderHook(() => useLoginPage());
    const fakeEvent = { preventDefault: jest.fn() } as any;
    await expect(
      act(async () => {
        await result.current.onLoginSubmit(fakeEvent);
      })
    ).resolves.not.toThrow();
  });
});
