/**
 * Fakemui Utilities Export
 * Centralized utilities for accessibility, testing, and common patterns
 */

export { generateTestId, testId, aria, keyboard, validate } from './accessibility'
export type { AccessibilityFeature, AccessibilityComponent, AccessibilityAction } from './accessibility'

// Re-export existing component utilities
export { default as classNames } from '../react/components/utils/classNames'
export { useMediaQuery } from '../react/components/utils/useMediaQuery'
export { Portal } from '../react/components/utils/Portal'
export { Dialog } from '../react/components/utils/Dialog'
export { Popover } from '../react/components/utils/Popover'
export { CssBaseline } from '../react/components/utils/CssBaseline'
export { GlobalStyles } from '../react/components/utils/GlobalStyles'
