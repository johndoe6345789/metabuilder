/**
 * Tests for Notification component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notification, { NotificationItem } from '../UI/Notification';

const makeNotification = (
  overrides: Partial<NotificationItem> = {}
): NotificationItem => ({
  id: 'n1',
  type: 'info',
  message: 'Test message',
  ...overrides,
});

describe('Notification', () => {
  it('renders the notification message', () => {
    render(
      <Notification
        notification={makeNotification({ message: 'Hello World' })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders a close button', () => {
    render(
      <Notification
        notification={makeNotification()}
        onClose={jest.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: /close notification/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(
      <Notification notification={makeNotification()} onClose={onClose} />
    );
    await userEvent.click(
      screen.getByRole('button', { name: /close notification/i })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the given duration', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(
      <Notification
        notification={makeNotification({ duration: 3000 })}
        onClose={onClose}
      />
    );
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('does not auto-dismiss when duration is not set', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(
      <Notification notification={makeNotification()} onClose={onClose} />
    );
    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    expect(onClose).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it.each(['success', 'error', 'warning', 'info'] as const)(
    'renders with notification type attribute: %s',
    (type) => {
      const { container } = render(
        <Notification
          notification={makeNotification({ type })}
          onClose={jest.fn()}
        />
      );
      const el = container.querySelector(`[data-notification-type="${type}"]`);
      expect(el).toBeInTheDocument();
    }
  );
});
