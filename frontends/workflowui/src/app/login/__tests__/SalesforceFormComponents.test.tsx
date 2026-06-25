/**
 * Tests for Salesforce login form sub-components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import SalesforceCredentialFields from '../SalesforceCredentialFields';
import SalesforceFormFields from '../SalesforceFormFields';

// ── SalesforceCredentialFields ───────────────────────────────────────────────
describe('SalesforceCredentialFields', () => {
  const props = {
    email: 'user@example.com',
    password: 'secret',
    isLoading: false,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
  };

  it('renders email input with correct value', () => {
    render(<SalesforceCredentialFields {...props} />);
    const input = screen.getByTestId('salesforce-email-input') as HTMLInputElement;
    expect(input.value).toBe('user@example.com');
  });

  it('renders password input with correct value', () => {
    render(<SalesforceCredentialFields {...props} />);
    const input = screen.getByTestId('salesforce-password-input') as HTMLInputElement;
    expect(input.value).toBe('secret');
  });

  it('calls setEmail on change', async () => {
    render(<SalesforceCredentialFields {...props} />);
    await userEvent.type(screen.getByTestId('salesforce-email-input'), 'a');
    expect(props.setEmail).toHaveBeenCalled();
  });

  it('calls setPassword on change', async () => {
    render(<SalesforceCredentialFields {...props} />);
    await userEvent.type(screen.getByTestId('salesforce-password-input'), 'x');
    expect(props.setPassword).toHaveBeenCalled();
  });

  it('disables inputs when isLoading', () => {
    render(<SalesforceCredentialFields {...props} isLoading />);
    expect(screen.getByTestId('salesforce-email-input')).toBeDisabled();
    expect(screen.getByTestId('salesforce-password-input')).toBeDisabled();
  });

  it('renders email and password labels', () => {
    render(<SalesforceCredentialFields {...props} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });
});

// ── SalesforceFormFields ─────────────────────────────────────────────────────
describe('SalesforceFormFields', () => {
  const props = {
    email: '',
    password: '',
    rememberMe: false,
    isLoading: false,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    setRememberMe: jest.fn(),
  };

  it('renders the remember me checkbox', () => {
    render(<SalesforceFormFields {...props} />);
    expect(screen.getByTestId('salesforce-remember-me')).toBeInTheDocument();
  });

  it('checkbox is unchecked by default', () => {
    render(<SalesforceFormFields {...props} />);
    const cb = screen.getByTestId('salesforce-remember-me') as HTMLInputElement;
    expect(cb.checked).toBe(false);
  });

  it('calls setRememberMe when checkbox changes', () => {
    render(<SalesforceFormFields {...props} />);
    fireEvent.click(screen.getByTestId('salesforce-remember-me'));
    expect(props.setRememberMe).toHaveBeenCalled();
  });

  it('renders forgot password link', () => {
    render(<SalesforceFormFields {...props} />);
    const link = screen.getByRole('link', { name: /forgot your password/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });

  it('renders "Remember me" label', () => {
    render(<SalesforceFormFields {...props} />);
    expect(screen.getByText('Remember me')).toBeInTheDocument();
  });
});
