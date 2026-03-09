/**
 * useUI Hook (Composition)
 * Combines all UI-related hooks for backward compatibility
 * Use individual hooks for more granular control
 */

import { useUIModals, type UseUIModalsReturn } from './useUIModals';
import { useUINotifications, type UseUINotificationsReturn } from './useUINotifications';
import { useUILoading, type UseUILoadingReturn } from './useUILoading';
import { useUITheme, type UseUIThemeReturn } from './useUITheme';
import { useUISidebar, type UseUISidebarReturn } from './useUISidebar';

export interface UseUIReturn
  extends UseUIModalsReturn,
    UseUINotificationsReturn,
    UseUILoadingReturn,
    UseUIThemeReturn,
    UseUISidebarReturn {}

// Re-export for convenience
export type UIContextReturn = UseUIReturn;

/**
 * Main UI hook that composes all specialized hooks
 * Maintains backward compatibility with original useUI interface
 */
export function useUI(): UseUIReturn {
  const modalsHook = useUIModals();
  const notificationsHook = useUINotifications();
  const loadingHook = useUILoading();
  const themeHook = useUITheme();
  const sidebarHook = useUISidebar();

  return {
    // Modals
    modals: modalsHook.modals,
    openModal: modalsHook.openModal,
    closeModal: modalsHook.closeModal,
    toggleModal: modalsHook.toggleModal,

    // Notifications
    notifications: notificationsHook.notifications,
    notify: notificationsHook.notify,
    success: notificationsHook.success,
    error: notificationsHook.error,
    warning: notificationsHook.warning,
    info: notificationsHook.info,
    removeNotification: notificationsHook.removeNotification,
    clearNotifications: notificationsHook.clearNotifications,

    // Loading
    loading: loadingHook.loading,
    loadingMessage: loadingHook.loadingMessage,
    setLoading: loadingHook.setLoading,
    setLoadingMessage: loadingHook.setLoadingMessage,

    // Theme
    theme: themeHook.theme,
    setTheme: themeHook.setTheme,
    toggleTheme: themeHook.toggleTheme,

    // Sidebar
    sidebarOpen: sidebarHook.sidebarOpen,
    setSidebar: sidebarHook.setSidebar,
    toggleSidebar: sidebarHook.toggleSidebar
  };
}

export default useUI;
