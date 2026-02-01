/**
 * useUINotifications Hook
 * Manages notifications (success, error, warning, info)
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setNotification,
  removeNotification,
  clearNotifications
} from '../../store/slices/uiSlice';
import { Notification } from '../../store/slices/uiSlice';

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
      dispatch(
        setNotification({
          id: `notification-${Date.now()}-${Math.random()}`,
          type,
          message,
          duration
        })
      );
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
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
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
