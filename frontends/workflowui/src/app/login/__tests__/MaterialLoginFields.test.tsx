/**
 * Tests for MaterialLoginFields component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MaterialLoginFields from '../MaterialLoginFields';

const defaultProps = {
  email: '',
  password: '',
  isLoading: false,
  setEmail: jest.fn(),
  setPassword: jest.fn(),
};

describe('MaterialLoginFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input', () => {
    render(<MaterialLoginFields {...defaultProps} />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<MaterialLoginFields {...defaultProps} />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('shows current email value', () => {
    render(<MaterialLoginFields {...defaultProps} email="test@example.com" />);
    const input = screen.getByTestId('email-input') as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('shows current password value', () => {
    render(<MaterialLoginFields {...defaultProps} password="secret123" />);
    const input = screen.getByTestId('password-input') as HTMLInputElement;
    expect(input.value).toBe('secret123');
  });

  it('calls setEmail when email input changes', () => {
    const setEmail = jest.fn();
    render(<MaterialLoginFields {...defaultProps} setEmail={setEmail} />);
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'new@email.com' },
    });
    expect(setEmail).toHaveBeenCalledWith('new@email.com');
  });

  it('calls setPassword when password input changes', () => {
    const setPassword = jest.fn();
    render(<MaterialLoginFields {...defaultProps} setPassword={setPassword} />);
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'newpass' },
    });
    expect(setPassword).toHaveBeenCalledWith('newpass');
  });

  it('disables inputs when isLoading is true', () => {
    render(<MaterialLoginFields {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('email-input')).toBeDisabled();
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });

  it('enables inputs when isLoading is false', () => {
    render(<MaterialLoginFields {...defaultProps} isLoading={false} />);
    expect(screen.getByTestId('email-input')).not.toBeDisabled();
    expect(screen.getByTestId('password-input')).not.toBeDisabled();
  });
});
