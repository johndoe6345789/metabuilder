/**
 * Tests for SalesforceLoginForm component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

// Mock hooks used by sub-components
jest.mock('../../../hooks', () => ({
  useAuthForm: jest.fn(() => ({
    email: '',
    password: '',
    localError: null,
    isLoading: false,
    errorMessage: null,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    clearErrors: jest.fn(),
  })),
  useLoginLogic: jest.fn(() => ({
    handleLogin: jest.fn(),
  })),
}));

import SalesforceLoginForm from '../SalesforceLoginForm';

const baseProps = {
  email: 'user@example.com',
  password: 'password123',
  isLoading: false,
  localError: null as string | null,
  errorMessage: null as string | null,
  rememberMe: false,
  setEmail: jest.fn(),
  setPassword: jest.fn(),
  setRememberMe: jest.fn(),
  onSubmit: jest.fn(),
  onSwitchToMaterial: jest.fn(),
};

describe('SalesforceLoginForm', () => {
  it('renders the salesforce login page', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-login-page')).toBeInTheDocument();
  });

  it('renders the Log In title', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-title')).toBeInTheDocument();
    // "Log In" text appears in both title and button
    const logInElements = screen.getAllByText('Log In');
    expect(logInElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders welcome subtitle', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByText('Welcome back to WorkflowUI')).toBeInTheDocument();
  });

  it('renders the login submit button', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-login-button')).toBeInTheDocument();
  });

  it('shows "Log In" on button when not loading', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-login-button')).toHaveTextContent('Log In');
  });

  it('disables login button when isLoading', () => {
    render(<SalesforceLoginForm {...baseProps} isLoading />);
    expect(screen.getByTestId('salesforce-login-button')).toBeDisabled();
  });

  it('shows error message when localError is set', () => {
    render(<SalesforceLoginForm {...baseProps} localError="Invalid credentials" />);
    expect(screen.getByTestId('salesforce-error')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows error message when errorMessage is set', () => {
    render(<SalesforceLoginForm {...baseProps} errorMessage="Server error" />);
    expect(screen.getByTestId('salesforce-error')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('does not show error when no errors', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.queryByTestId('salesforce-error')).not.toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn();
    render(<SalesforceLoginForm {...baseProps} onSubmit={onSubmit} />);
    fireEvent.submit(document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders social buttons (Google)', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-google-login')).toBeInTheDocument();
  });

  it('renders social buttons (Microsoft)', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('salesforce-microsoft-login')).toBeInTheDocument();
  });

  it('renders brand panel', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByText('WorkflowUI')).toBeInTheDocument();
  });

  it('renders the register link in footer', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    const link = screen.getByRole('link', { name: /create an account/i });
    expect(link).toBeInTheDocument();
  });

  it('renders switch to material button in footer', () => {
    render(<SalesforceLoginForm {...baseProps} />);
    expect(screen.getByTestId('switch-to-material')).toBeInTheDocument();
  });
});
