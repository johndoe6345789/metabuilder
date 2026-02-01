'use client'

/**
 * ToastContext - Re-exported from @metabuilder/hooks
 *
 * BACKWARD COMPATIBILITY: This file re-exports from @metabuilder/hooks
 * for consumers still importing from @metabuilder/fakemui.
 *
 * Prefer importing directly from @metabuilder/hooks:
 * import { ToastProvider, useToast } from '@metabuilder/hooks'
 */

export {
  ToastProvider,
  useToast,
} from '@metabuilder/hooks'

export type {
  ToastSeverity,
  ToastOptions,
  ToastContextValue,
  ToastProviderProps,
} from '@metabuilder/hooks'

export default ToastProvider
