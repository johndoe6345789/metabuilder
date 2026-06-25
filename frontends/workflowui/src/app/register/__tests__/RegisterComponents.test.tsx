/**
 * Tests for register page components and hook
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the absolute path for components/feedback (avoids ESM parse errors)
jest.mock('/home/linuxuser/Documents/GitHub/metabuilder/components/feedback', () => ({
  PasswordStrengthIndicator: ({ strength }: any) => <div data-testid="psi" data-strength={strength} />,
  NotFoundState: () => <div>Not Found</div>,
}), { virtual: true });

const mockClearErrors = jest.fn();
const mockSetEmail = jest.fn();
const mockSetPassword = jest.fn();
const mockHandlePasswordChange = jest.fn();
const mockHandleRegister = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../hooks', () => ({
  useAuthForm: jest.fn(() => ({
    email: 'test@example.com',
    password: 'Passw0rd!',
    localError: null,
    isLoading: false,
    errorMessage: null,
    setEmail: mockSetEmail,
    setPassword: mockSetPassword,
    clearErrors: mockClearErrors,
  })),
  usePasswordValidation: jest.fn(() => ({
    passwordStrength: 3,
    validatePassword: jest.fn(() => ({ message: 'Good' })),
    handlePasswordChange: mockHandlePasswordChange,
  })),
  useRegisterLogic: jest.fn(() => ({
    handleRegister: mockHandleRegister,
  })),
}));

import RegisterFormFields from '../RegisterFormFields';
import PasswordFieldWithStrength from '../PasswordFieldWithStrength';
import { useRegisterPage } from '../hooks/useRegisterPage';

// ── PasswordFieldWithStrength ─────────────────────────────────────────────────
describe('PasswordFieldWithStrength', () => {
  const props = {
    password: 'mypassword',
    isLoading: false,
    passwordStrength: 2,
    validatePassword: jest.fn(() => ({ message: 'Weak' })),
    onPasswordChange: jest.fn(),
  };

  it('renders password input', () => {
    render(<PasswordFieldWithStrength {...props} />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('calls onPasswordChange when typing', async () => {
    render(<PasswordFieldWithStrength {...props} />);
    await userEvent.type(screen.getByTestId('password-input'), 'x');
    expect(props.onPasswordChange).toHaveBeenCalled();
  });

  it('disables input when isLoading', () => {
    render(<PasswordFieldWithStrength {...props} isLoading />);
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });
});

// ── RegisterFormFields ────────────────────────────────────────────────────────
describe('RegisterFormFields', () => {
  const props = {
    name: 'John Doe',
    email: 'john@example.com',
    confirmPassword: '',
    password: 'Passw0rd!',
    isLoading: false,
    passwordStrength: 4,
    validatePassword: jest.fn(() => ({ message: 'Strong' })),
    onPasswordChange: jest.fn(),
    setName: jest.fn(),
    setEmail: jest.fn(),
    setConfirmPassword: jest.fn(),
  };

  it('renders name input', () => {
    render(<RegisterFormFields {...props} />);
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<RegisterFormFields {...props} />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<RegisterFormFields {...props} />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('renders confirm password input', () => {
    render(<RegisterFormFields {...props} />);
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
  });

  it('calls setName when name changes', async () => {
    render(<RegisterFormFields {...props} />);
    await userEvent.type(screen.getByTestId('name-input'), 'a');
    expect(props.setName).toHaveBeenCalled();
  });

  it('calls setEmail when email changes', async () => {
    render(<RegisterFormFields {...props} />);
    await userEvent.type(screen.getByTestId('email-input'), 'a');
    expect(props.setEmail).toHaveBeenCalled();
  });

  it('calls setConfirmPassword when confirm input changes', async () => {
    render(<RegisterFormFields {...props} />);
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'x');
    expect(props.setConfirmPassword).toHaveBeenCalled();
  });

  it('disables all inputs when isLoading', () => {
    render(<RegisterFormFields {...props} isLoading />);
    expect(screen.getByTestId('name-input')).toBeDisabled();
    expect(screen.getByTestId('email-input')).toBeDisabled();
    expect(screen.getByTestId('confirm-password-input')).toBeDisabled();
  });
});

// ── useRegisterPage ───────────────────────────────────────────────────────────
describe('useRegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns email from useAuthForm', () => {
    const { result } = renderHook(() => useRegisterPage());
    expect(result.current.email).toBe('test@example.com');
  });

  it('initializes name as empty string', () => {
    const { result } = renderHook(() => useRegisterPage());
    expect(result.current.name).toBe('');
  });

  it('initializes confirmPassword as empty string', () => {
    const { result } = renderHook(() => useRegisterPage());
    expect(result.current.confirmPassword).toBe('');
  });

  it('setName updates name', () => {
    const { result } = renderHook(() => useRegisterPage());
    act(() => {
      result.current.setName('Alice');
    });
    expect(result.current.name).toBe('Alice');
  });

  it('setConfirmPassword updates confirmPassword', () => {
    const { result } = renderHook(() => useRegisterPage());
    act(() => {
      result.current.setConfirmPassword('secret123');
    });
    expect(result.current.confirmPassword).toBe('secret123');
  });

  it('onPasswordChange calls setPassword and handlePasswordChange', () => {
    const { result } = renderHook(() => useRegisterPage());
    act(() => {
      result.current.onPasswordChange('NewPass123');
    });
    expect(mockSetPassword).toHaveBeenCalledWith('NewPass123');
    expect(mockHandlePasswordChange).toHaveBeenCalledWith('NewPass123');
  });

  it('onRegisterSubmit calls clearErrors and handleRegister', async () => {
    const { result } = renderHook(() => useRegisterPage());
    const fakeEvent = { preventDefault: jest.fn() } as any;
    await act(async () => {
      await result.current.onRegisterSubmit(fakeEvent);
    });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(mockClearErrors).toHaveBeenCalled();
    expect(mockHandleRegister).toHaveBeenCalledWith({
      name: '',
      email: 'test@example.com',
      password: 'Passw0rd!',
      confirmPassword: '',
    });
  });

  it('returns passwordStrength from usePasswordValidation', () => {
    const { result } = renderHook(() => useRegisterPage());
    expect(result.current.passwordStrength).toBe(3);
  });
});
