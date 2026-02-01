/**
 * useAccessible Hooks - Re-exported from root hooks folder
 *
 * This file re-exports from the root hooks folder to maintain backwards
 * compatibility with existing imports in fakemui components.
 *
 * Direct import from root hooks folder bypasses the barrel export
 * to avoid pulling in hooks with project-specific dependencies.
 */

export {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
  useAccessible,
  useKeyboardNavigation,
  useFocusManagement,
  useLiveRegion,
  useFocusTrap,
} from '../../../hooks/useAccessible'

export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from '../../../hooks/useAccessible'
