/**
 * Tests for NotificationContainer component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../hooks', () => ({
  useUI: jest.fn(),
}));

import { useUI } from '../../hooks';
import NotificationContainer from '../UI/NotificationContainer';

const mockUseUI = useUI as jest.Mock;

const makeNotification = (overrides = {}) => ({
  id: 'n1',
  type: 'info' as const,
  message: 'Test notification',
  ...overrides,
});

describe('NotificationContainer', () => {
  it('renders no notifications when list is empty', () => {
    mockUseUI.mockReturnValue({
      notifications: [],
      removeNotification: jest.fn(),
    });
    const { container } = render(<NotificationContainer />);
    // Region exists but is empty of notification items
    expect(container.querySelectorAll('[data-notification-type]')).toHaveLength(0);
  });

  it('has role="region" and aria-live="polite"', () => {
    mockUseUI.mockReturnValue({
      notifications: [],
      removeNotification: jest.fn(),
    });
    render(<NotificationContainer />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('renders a notification for each item', () => {
    mockUseUI.mockReturnValue({
      notifications: [
        makeNotification({ id: 'n1', message: 'First' }),
        makeNotification({ id: 'n2', message: 'Second' }),
      ],
      removeNotification: jest.fn(),
    });
    render(<NotificationContainer />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('calls removeNotification when close button is clicked', async () => {
    const removeNotification = jest.fn();
    mockUseUI.mockReturnValue({
      notifications: [makeNotification({ id: 'n42' })],
      removeNotification,
    });
    render(<NotificationContainer />);
    await userEvent.click(
      screen.getByRole('button', { name: /close notification/i })
    );
    expect(removeNotification).toHaveBeenCalledWith('n42');
  });
});
