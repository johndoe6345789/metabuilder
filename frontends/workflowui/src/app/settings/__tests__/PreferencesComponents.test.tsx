/**
 * Tests for settings preferences components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PreferencesAppearance from '../PreferencesAppearance';
import PreferencesNotifications from '../PreferencesNotifications';
import DeleteAccountDialog from '../DeleteAccountDialog';

// ── PreferencesAppearance ────────────────────────────────────────────────────
describe('PreferencesAppearance', () => {
  const props = {
    theme: 'system',
    setTheme: jest.fn(),
    language: 'en',
    setLanguage: jest.fn(),
  };

  it('renders the theme select', () => {
    render(<PreferencesAppearance {...props} />);
    expect(screen.getByTestId('theme-select')).toBeInTheDocument();
  });

  it('renders the language select', () => {
    render(<PreferencesAppearance {...props} />);
    expect(screen.getByTestId('language-select')).toBeInTheDocument();
  });

  it('calls setTheme when theme changes', () => {
    render(<PreferencesAppearance {...props} />);
    fireEvent.change(screen.getByTestId('theme-select'), {
      target: { value: 'dark' },
    });
    expect(props.setTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setLanguage when language changes', () => {
    render(<PreferencesAppearance {...props} />);
    fireEvent.change(screen.getByTestId('language-select'), {
      target: { value: 'es' },
    });
    expect(props.setLanguage).toHaveBeenCalledWith('es');
  });

  it('renders "Theme" label', () => {
    render(<PreferencesAppearance {...props} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });
});

// ── PreferencesNotifications ─────────────────────────────────────────────────
describe('PreferencesNotifications', () => {
  const props = {
    notifications: false,
    setNotifications: jest.fn(),
    emailUpdates: false,
    setEmailUpdates: jest.fn(),
  };

  it('renders the notifications switch', () => {
    render(<PreferencesNotifications {...props} />);
    expect(screen.getByTestId('notifications-switch')).toBeInTheDocument();
  });

  it('renders the email updates switch', () => {
    render(<PreferencesNotifications {...props} />);
    expect(screen.getByTestId('email-updates-switch')).toBeInTheDocument();
  });

  it('calls setNotifications on toggle', () => {
    render(<PreferencesNotifications {...props} />);
    fireEvent.click(screen.getByTestId('notifications-switch'));
    expect(props.setNotifications).toHaveBeenCalled();
  });

  it('calls setEmailUpdates on toggle', () => {
    render(<PreferencesNotifications {...props} />);
    fireEvent.click(screen.getByTestId('email-updates-switch'));
    expect(props.setEmailUpdates).toHaveBeenCalled();
  });

  it('renders "Enable notifications" label', () => {
    render(<PreferencesNotifications {...props} />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });
});

// ── DeleteAccountDialog ──────────────────────────────────────────────────────
describe('DeleteAccountDialog', () => {
  it('does not render when open is false', () => {
    const { container } = render(
      <DeleteAccountDialog open={false} onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <DeleteAccountDialog open onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the dialog title', () => {
    render(
      <DeleteAccountDialog open onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(screen.getByText('Delete Account?')).toBeInTheDocument();
  });

  it('calls onConfirm when "Delete Permanently" button is clicked', async () => {
    const onConfirm = jest.fn();
    render(
      <DeleteAccountDialog open onClose={jest.fn()} onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByTestId('confirm-delete-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(
      <DeleteAccountDialog open onClose={onClose} onConfirm={jest.fn()} />
    );
    await userEvent.click(screen.getByTestId('cancel-delete-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders warning text', () => {
    render(
      <DeleteAccountDialog open onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });
});
