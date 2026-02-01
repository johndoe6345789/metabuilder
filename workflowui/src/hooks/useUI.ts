/**
 * useUI Hook (Backward Compatibility Wrapper)
 * This file maintains backward compatibility by re-exporting from the new modular location
 *
 * DEPRECATED: Direct imports from './hooks/useUI' are still supported but importing
 * from './hooks' or the individual specialized hooks is recommended for better tree-shaking.
 *
 * Migration path:
 * - Old: import { useUI } from './hooks/useUI'
 * - New: import { useUI } from './hooks'
 * - Best: import { useUIModals } from './hooks' // for specific functionality
 */

export { useUI, type UseUIReturn } from './ui';
export type {
  UseUIModalsReturn,
  UseUINotificationsReturn,
  UseUILoadingReturn,
  UseUIThemeReturn,
  UseUISidebarReturn
} from './ui';
