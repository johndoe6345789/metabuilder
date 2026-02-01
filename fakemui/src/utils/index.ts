/**
 * Fakemui Utilities Export
 * Re-exports utilities from root hooks folder for backwards compatibility
 */

// Accessibility utilities (from root hooks folder)
export { generateTestId, testId, aria, keyboard, validate } from './accessibility'
export type { AccessibilityFeature, AccessibilityComponent, AccessibilityAction } from './accessibility'

// React hooks (from root hooks folder via component utils)
export { useAccessible, useKeyboardNavigation, useFocusManagement, useLiveRegion, useFocusTrap } from './useAccessible'
