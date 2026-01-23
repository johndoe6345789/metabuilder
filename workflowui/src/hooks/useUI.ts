/**
 * useUI Hook
 * Hook for UI state management (modals, notifications, theme)
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import {
  openModal,
  closeModal,
  toggleModal,
  setNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLoading,
  setLoadingMessage
} from '@store/slices/uiSlice';
import { Notification } from '@store/slices/uiSlice';

export function useUI() {
  const dispatch = useDispatch();

  // Selectors
  const modals = useSelector((state: RootState) => state.ui.modals);
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const loading = useSelector((state: RootState) => state.ui.loading);
  const loadingMessage = useSelector((state: RootState) => state.ui.loadingMessage);

  /**
   * Open modal
   */
  const open = useCallback(
    (modalName: keyof typeof modals) => {
      dispatch(openModal(modalName));
    },
    [dispatch]
  );

  /**
   * Close modal
   */
  const close = useCallback(
    (modalName: keyof typeof modals) => {
      dispatch(closeModal(modalName));
    },
    [dispatch]
  );

  /**
   * Toggle modal
   */
  const toggle = useCallback(
    (modalName: keyof typeof modals) => {
      dispatch(toggleModal(modalName));
    },
    [dispatch]
  );

  /**
   * Show notification
   */
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

  /**
   * Show success notification
   */
  const success = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'success', duration);
    },
    [notify]
  );

  /**
   * Show error notification
   */
  const error = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'error', duration);
    },
    [notify]
  );

  /**
   * Show warning notification
   */
  const warning = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'warning', duration);
    },
    [notify]
  );

  /**
   * Show info notification
   */
  const info = useCallback(
    (message: string, duration?: number) => {
      notify(message, 'info', duration);
    },
    [notify]
  );

  /**
   * Remove notification by ID
   */
  const removeNotify = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  /**
   * Set theme
   */
  const setCurrentTheme = useCallback(
    (newTheme: 'light' | 'dark') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  /**
   * Toggle theme
   */
  const toggleCurrentTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  /**
   * Set sidebar open state
   */
  const setSidebar = useCallback(
    (open: boolean) => {
      dispatch(setSidebarOpen(open));
    },
    [dispatch]
  );

  /**
   * Toggle sidebar
   */
  const toggleCurrentSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  /**
   * Set loading state
   */
  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      dispatch(setLoading(isLoading));
    },
    [dispatch]
  );

  /**
   * Set loading message
   */
  const setLoadMsg = useCallback(
    (message: string | null) => {
      dispatch(setLoadingMessage(message));
    },
    [dispatch]
  );

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Load theme preference from localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('workflow-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        dispatch(setTheme(savedTheme));
      }
    }
  }, [dispatch]);

  return {
    // State
    modals,
    notifications,
    theme,
    sidebarOpen,
    loading,
    loadingMessage,

    // Modal actions
    openModal: open,
    closeModal: close,
    toggleModal: toggle,

    // Notification actions
    notify,
    success,
    error,
    warning,
    info,
    removeNotification: removeNotify,
    clearNotifications: clearAllNotifications,

    // Theme actions
    setTheme: setCurrentTheme,
    toggleTheme: toggleCurrentTheme,

    // Sidebar actions
    setSidebar,
    toggleSidebar: toggleCurrentSidebar,

    // Loading actions
    setLoading: setIsLoading,
    setLoadingMessage: setLoadMsg
  };
}
