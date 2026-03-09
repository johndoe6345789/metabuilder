/**
 * Accessibility Utilities - Re-exported from root hooks folder
 *
 * This file re-exports accessibility utilities from the root hooks folder
 * to maintain backwards compatibility with existing imports in fakemui.
 *
 * For new code, import directly from the hooks folder:
 * import { generateTestId, testId, aria } from '../../../hooks/useAccessible'
 */

export {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
} from '../../../hooks/useAccessible'

export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from '../../../hooks/useAccessible'
