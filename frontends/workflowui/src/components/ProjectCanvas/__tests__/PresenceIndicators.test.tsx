/**
 * Tests for PresenceIndicators component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PresenceIndicators, UserPresence } from '../PresenceIndicators';

const makeUser = (overrides: Partial<UserPresence> = {}): UserPresence => ({
  userId: 'u1',
  userName: 'Alice',
  userColor: '#ff0000',
  ...overrides,
});

describe('PresenceIndicators', () => {
  it('shows "Solo editing" when no other users', () => {
    render(<PresenceIndicators users={[]} currentUserId="u1" />);
    expect(screen.getByText('Solo editing')).toBeInTheDocument();
  });

  it('shows "Solo editing" when only current user in list', () => {
    const users = [makeUser({ userId: 'u1', userName: 'Me' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.getByText('Solo editing')).toBeInTheDocument();
  });

  it('does not show "Solo editing" when other users present', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Bob' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.queryByText('Solo editing')).not.toBeInTheDocument();
  });

  it('renders other users by name initial', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Bob' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders user name in tooltip', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Bob' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.getByTitle('Bob (viewing)')).toBeInTheDocument();
  });

  it('shows editing tooltip when user has lockedItemId', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Carol', lockedItemId: 'item-1' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.getByTitle('Carol (editing)')).toBeInTheDocument();
  });

  it('shows "Editing..." text when user has lockedItemId', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Dave', lockedItemId: 'node-5' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.getByText('Editing...')).toBeInTheDocument();
  });

  it('does not show "Editing..." when user has no lockedItemId', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Eve' })];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.queryByText('Editing...')).not.toBeInTheDocument();
  });

  it('filters out current user from display', () => {
    const users = [
      makeUser({ userId: 'u1', userName: 'Me' }),
      makeUser({ userId: 'u2', userName: 'Frank' }),
    ];
    render(<PresenceIndicators users={users} currentUserId="u1" />);
    expect(screen.queryByText('M')).not.toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('applies user color as background', () => {
    const users = [makeUser({ userId: 'u2', userName: 'Bob', userColor: '#123456' })];
    const { container } = render(<PresenceIndicators users={users} currentUserId="u1" />);
    const colorEl = container.querySelector('[style*="background-color"]') as HTMLElement;
    expect(colorEl).not.toBeNull();
    expect(colorEl.style.backgroundColor).toBeTruthy();
  });
});
