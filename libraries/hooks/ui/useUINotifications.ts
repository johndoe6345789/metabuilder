/**
 * useUINotifications Hook
 * Manages notifications (success, error, warning, info)
 *
 * Requires: ui slice with notifications array
 * Actions: setNotification, removeNotification, clearNotifications from uiSlice
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Generic UI state interface
interface UIState {
  notifications: Notification[];
}

interface RootState {
  ui: UIState;
}

export interface UseUINotificationsReturn {
  notifications: Notification[];
  notify: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export function useUINotifications(): UseUINotificationsReturn {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      dispatch({
        type: 'ui/setNotification',
        payload: {
          id,
          type,
          message,
          duration
        }
      });

      // Auto-remove after duration (must be handled here, not in reducer)
      if (duration > 0) {
        setTimeout(() => {
          dispatch({ type: 'ui/removeNotification', payload: id });
        }, duration);
      }
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'success', duration);
    },
    [notify]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'error', duration);
    },
    [notify]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'warning', duration);
    },
    [notify]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'info', duration);
    },
    [notify]
  );

  const removeNotify = useCallback(
    (id: string) => {
      dispatch({ type: 'ui/removeNotification', payload: id });
    },
    [dispatch]
  );

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'ui/clearNotifications' });
  }, [dispatch]);

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification: removeNotify,
    clearNotifications: clearAllNotifications
  };
}

export default useUINotifications;
