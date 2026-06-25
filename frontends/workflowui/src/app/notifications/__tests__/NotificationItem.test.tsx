/**
 * Tests for NotificationItem component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NotificationItem from '../NotificationItem';

const makeNotification = (overrides = {}) => ({
  id: 'n1',
  title: 'Workflow Completed',
  message: 'Your workflow ran successfully.',
  type: 'workflow',
  read: false,
  time: '12:00 PM',
  timeAgo: '5m ago',
  ...overrides,
});

describe('NotificationItem', () => {
  it('renders the notification title', () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Workflow Completed')).toBeInTheDocument();
  });

  it('renders the notification message', () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Your workflow ran successfully.')).toBeInTheDocument();
  });

  it('renders time ago', () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('5m ago')).toBeInTheDocument();
  });

  it('renders the time', () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });

  it('renders the type', () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('workflow')).toBeInTheDocument();
  });

  it('calls onMarkRead when item is clicked', async () => {
    const onMarkRead = jest.fn();
    const { container } = render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={onMarkRead}
        onDelete={jest.fn()}
      />
    );
    // Click the outer div
    const item = container.firstChild as HTMLElement;
    fireEvent.click(item);
    expect(onMarkRead).toHaveBeenCalledWith('n1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={jest.fn()}
        onDelete={onDelete}
      />
    );
    const deleteBtn = screen.getByRole('button', { name: /delete notification/i });
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('n1');
  });

  it('renders unread dot for unread notifications', () => {
    const { container } = render(
      <NotificationItem
        notification={makeNotification({ read: false })}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    // The unread dot is a span - verify via container
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('works for read notifications', () => {
    render(
      <NotificationItem
        notification={makeNotification({ read: true })}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Workflow Completed')).toBeInTheDocument();
  });

  it('renders plugin type notifications', () => {
    render(
      <NotificationItem
        notification={makeNotification({ type: 'plugin', title: 'Plugin Updated' })}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Plugin Updated')).toBeInTheDocument();
    expect(screen.getByText('plugin')).toBeInTheDocument();
  });

  it('renders system type notifications', () => {
    render(
      <NotificationItem
        notification={makeNotification({ type: 'system', title: 'System Alert' })}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('System Alert')).toBeInTheDocument();
  });

  it('delete button click does not propagate to onMarkRead', async () => {
    const onMarkRead = jest.fn();
    const onDelete = jest.fn();
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    const deleteBtn = screen.getByRole('button', { name: /delete notification/i });
    await userEvent.click(deleteBtn);
    // onMarkRead should NOT have been called (stopPropagation)
    expect(onMarkRead).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('n1');
  });
});
