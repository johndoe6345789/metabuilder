/**
 * Accessibility Utilities for WorkflowUI
 * Re-exports from Fakemui to ensure consistent accessibility patterns project-wide
 */

// Re-export types
export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from '@/fakemui'

// Re-export utilities
export { generateTestId, testId, aria, keyboard, validate } from '@/fakemui'
