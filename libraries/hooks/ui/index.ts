/**
 * UI Hooks Index
 * Exports all UI-related hooks
 * Provides backward-compatible interface with original useUI
 *
 * Requirements:
 * - Store must have a 'ui' slice with the appropriate state shape
 * - uiSlice must define actions: openModal, closeModal, toggleModal,
 *   setNotification, removeNotification, clearNotifications,
 *   setTheme, toggleTheme, setSidebarOpen, toggleSidebar,
 *   setLoading, setLoadingMessage
 */

export { useUI, type UseUIReturn, type UIContextReturn } from './useUI';
export { useUIModals, type UseUIModalsReturn } from './useUIModals';
export { useUINotifications, type UseUINotificationsReturn, type Notification } from './useUINotifications';
export { useUILoading, type UseUILoadingReturn, createUseUILoading } from './useUILoading';
export { useUITheme, type UseUIThemeReturn } from './useUITheme';
export { useUISidebar, type UseUISidebarReturn } from './useUISidebar';

// Generic UI hooks (migrated from codegen)
// Note: useAccordion and useLastSaved are already exported from hooks root
export { useDialogState, useMultipleDialogs } from '../src/ui/use-dialog-state';
export { useFocusState } from '../src/ui/use-focus-state';
export { useCopyState } from '../src/ui/use-copy-state';
export { useIsMobile } from '../src/ui/use-mobile';
export { usePasswordVisibility } from '../src/ui/use-password-visibility';
export { usePopoverState } from '../src/ui/use-popover-state';
export { useTabNavigation } from '../src/ui/use-tab-navigation';
export { useFormatValue } from '../src/ui/use-format-value';
export { useImageState } from '../src/ui/use-image-state';
export { useActiveSelection } from '../src/ui/use-active-selection';
