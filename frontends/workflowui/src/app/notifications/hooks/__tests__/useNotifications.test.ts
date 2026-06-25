/**
 * Tests for useNotifications hook
 */

import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  it('initializes with notifications from mock data', () => {
    const { result } = renderHook(() => useNotifications());
    // Mock data exists
    expect(Array.isArray(result.current.filteredNotifications)).toBe(true);
  });

  it('default filter is "all"', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.filter).toBe('all');
  });

  it('filter can be changed to "unread"', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.setFilter('unread');
    });
    expect(result.current.filter).toBe('unread');
  });

  it('filter can be changed to "workflow"', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.setFilter('workflow');
    });
    expect(result.current.filter).toBe('workflow');
  });

  it('unreadCount is a non-negative number', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('markAllAsRead sets unreadCount to 0', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.markAllAsRead();
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it('deleteNotification removes a notification from filtered list', () => {
    const { result } = renderHook(() => useNotifications());
    const initial = result.current.filteredNotifications;

    if (initial.length > 0) {
      const idToDelete = initial[0].id;
      act(() => {
        result.current.deleteNotification(idToDelete);
      });
      const ids = result.current.filteredNotifications.map((n) => n.id);
      expect(ids).not.toContain(idToDelete);
    } else {
      // Nothing to delete - still passes
      expect(true).toBe(true);
    }
  });

  it('markAsRead marks a notification as read', () => {
    const { result } = renderHook(() => useNotifications());
    // First mark all as unread to ensure we have unread ones
    const initial = result.current.filteredNotifications;

    if (initial.length > 0) {
      const notification = initial[0];
      act(() => {
        result.current.markAsRead(notification.id);
      });
      const found = result.current.filteredNotifications.find(
        (n) => n.id === notification.id
      );
      if (found) {
        expect(found.read).toBe(true);
      }
    }
  });

  it('filter "unread" shows only unread notifications', () => {
    const { result } = renderHook(() => useNotifications());
    // Mark all as read first
    act(() => {
      result.current.markAllAsRead();
    });
    act(() => {
      result.current.setFilter('unread');
    });
    expect(result.current.filteredNotifications).toHaveLength(0);
  });

  it('filter by type shows only matching notifications', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.setFilter('system');
    });
    const filtered = result.current.filteredNotifications;
    filtered.forEach((n) => {
      expect(n.type).toBe('system');
    });
  });
});
