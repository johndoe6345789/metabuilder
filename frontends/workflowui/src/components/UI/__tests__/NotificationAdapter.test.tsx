/**
 * Tests for NotificationAdapter component
 */

const mockUseUINotifications = jest.fn();

jest.mock('@metabuilder/hooks', () => ({
  useUINotifications: () => mockUseUINotifications(),
}));

// The real m3 mock doesn't include NotificationContainer - add it here
jest.mock('@metabuilder/m3', () => ({
  ...jest.requireActual('@metabuilder/m3'),
  NotificationContainer: ({ notifications, onClose, position, maxVisible, className }: any) => (
    <div
      role="region"
      data-position={position}
      data-max-visible={maxVisible}
      className={className}
    >
      {notifications.slice(0, maxVisible ?? notifications.length).map((n: any) => (
        <div key={n.id}>
          <span>{n.message}</span>
          <button onClick={() => onClose(n.id)}>close</button>
        </div>
      ))}
    </div>
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationAdapter } from '../NotificationAdapter';

describe('NotificationAdapter', () => {
  beforeEach(() => {
    mockUseUINotifications.mockReturnValue({
      notifications: [],
      removeNotification: jest.fn(),
    });
  });

  it('renders without error when no notifications', () => {
    render(<NotificationAdapter />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('maps notifications and renders messages', () => {
    mockUseUINotifications.mockReturnValue({
      notifications: [
        { id: 'n1', type: 'success', message: 'Done!', duration: 3000 },
      ],
      removeNotification: jest.fn(),
    });
    render(<NotificationAdapter />);
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('calls removeNotification when close button clicked', () => {
    const removeNotification = jest.fn();
    mockUseUINotifications.mockReturnValue({
      notifications: [
        { id: 'n42', type: 'info', message: 'Hello', duration: 2000 },
      ],
      removeNotification,
    });
    render(<NotificationAdapter />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(removeNotification).toHaveBeenCalledWith('n42');
  });

  it('passes position prop to NotificationContainer', () => {
    render(<NotificationAdapter position="bottom-left" />);
    expect(screen.getByRole('region')).toHaveAttribute('data-position', 'bottom-left');
  });

  it('uses default position top-right', () => {
    render(<NotificationAdapter />);
    expect(screen.getByRole('region')).toHaveAttribute('data-position', 'top-right');
  });

  it('passes maxVisible prop', () => {
    render(<NotificationAdapter maxVisible={3} />);
    expect(screen.getByRole('region')).toHaveAttribute('data-max-visible', '3');
  });

  it('passes className prop', () => {
    render(<NotificationAdapter className="my-notifications" />);
    expect(screen.getByRole('region')).toHaveClass('my-notifications');
  });
});
