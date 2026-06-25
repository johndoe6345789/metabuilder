/**
 * @metabuilder/hooks-core
 * Core React hooks for workflow UI applications
 * 
 * Includes pure Redux-based hooks for:
 * - Canvas state management (zoom, pan, selection, settings, grid utilities)
 * - Editor state management (zoom, pan, nodes, edges, selection, clipboard, history)
 * - UI state management (modals, notifications, loading, theme, sidebar)
 * - Utility hooks (canvas virtualization, responsive sidebar, password validation)
 * 
 * All hooks in this package are service-independent and can be used across
 * any workflow UI implementation. They depend only on Redux and React.
 * 
 * Requirements:
 * - Redux store configured with workflow slices (@metabuilder/redux-slices)
 * - react-redux Provider wrapping your app
 */

// Canvas Hooks
export * from './canvas'

// Editor Hooks
export * from './editor'

// UI Hooks
export * from './ui'

// Utility Hooks
export { useCanvasVirtualization } from './useCanvasVirtualization'

export { useResponsiveSidebar } from './useResponsiveSidebar'
export type { UseResponsiveSidebarReturn } from './useResponsiveSidebar'

export { usePasswordValidation } from './usePasswordValidation'
export type { PasswordValidationResult } from './usePasswordValidation'
