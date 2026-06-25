/**
 * Tests for Notifications page components:
 * NotificationsHeader, NotificationsFilterBar
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationsHeader from '../NotificationsHeader';
import NotificationsFilterBar from '../NotificationsFilterBar';

// ---------------------------------------------------------------------------
// NotificationsHeader
// ---------------------------------------------------------------------------
describe('NotificationsHeader', () => {
  it('renders "Notifications" title', () => {
    render(<NotificationsHeader unreadCount={0} onMarkAllRead={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
  });

  it('renders unread badge when unreadCount > 0', () => {
    render(<NotificationsHeader unreadCount={5} onMarkAllRead={jest.fn()} />);
    expect(screen.getByText(/5 unread/i)).toBeInTheDocument();
  });

  it('does not render unread badge when unreadCount is 0', () => {
    render(<NotificationsHeader unreadCount={0} onMarkAllRead={jest.fn()} />);
    expect(screen.queryByText(/unread/i)).not.toBeInTheDocument();
  });

  it('renders "Mark all as read" button', () => {
    render(<NotificationsHeader unreadCount={3} onMarkAllRead={jest.fn()} />);
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();
  });

  it('"Mark all as read" button is disabled when unreadCount is 0', () => {
    render(<NotificationsHeader unreadCount={0} onMarkAllRead={jest.fn()} />);
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeDisabled();
  });

  it('"Mark all as read" button is enabled when unreadCount > 0', () => {
    render(<NotificationsHeader unreadCount={2} onMarkAllRead={jest.fn()} />);
    expect(screen.getByRole('button', { name: /mark all as read/i })).not.toBeDisabled();
  });

  it('calls onMarkAllRead when button clicked', () => {
    const onMarkAllRead = jest.fn();
    render(<NotificationsHeader unreadCount={3} onMarkAllRead={onMarkAllRead} />);
    fireEvent.click(screen.getByRole('button', { name: /mark all as read/i }));
    expect(onMarkAllRead).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// NotificationsFilterBar
// ---------------------------------------------------------------------------
describe('NotificationsFilterBar', () => {
  it('renders all filter buttons', () => {
    render(
      <NotificationsFilterBar filter="all" unreadCount={0} onSetFilter={jest.fn()} />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Plugin')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('calls onSetFilter when a filter button clicked', () => {
    const onSetFilter = jest.fn();
    render(
      <NotificationsFilterBar filter="all" unreadCount={0} onSetFilter={onSetFilter} />
    );
    fireEvent.click(screen.getByText('Workflow'));
    expect(onSetFilter).toHaveBeenCalledWith('workflow');
  });

  it('shows unread count badge in Unread button when count > 0', () => {
    render(
      <NotificationsFilterBar filter="all" unreadCount={7} onSetFilter={jest.fn()} />
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not show count in Unread button when count is 0', () => {
    const { container } = render(
      <NotificationsFilterBar filter="all" unreadCount={0} onSetFilter={jest.fn()} />
    );
    // No badge span with numeric content
    const spans = Array.from(container.querySelectorAll('span'));
    const numericSpans = spans.filter((s) => /^\d+$/.test(s.textContent || ''));
    expect(numericSpans).toHaveLength(0);
  });
});
