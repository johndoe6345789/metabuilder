'use client'

/**
 * ToastContext - Re-exported from root hooks folder
 *
 * This provides toast notifications for FakeMUI components.
 * Direct import from root hooks folder bypasses the barrel export
 * to avoid pulling in hooks with project-specific dependencies.
 */

export {
  ToastProvider,
  useToast,
} from '../../../hooks/useToast'

export type {
  ToastSeverity,
  ToastOptions,
  ToastContextValue,
  ToastProviderProps,
} from '../../../hooks/useToast'

// Re-export ToastProvider as default for backwards compatibility
import { ToastProvider } from '../../../hooks/useToast'
export default ToastProvider
