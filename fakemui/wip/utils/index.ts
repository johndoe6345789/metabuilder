/**
 * Fakemui Utils Barrel Export
 * Re-exports all utility modules
 */

export {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
} from './accessibility'

export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from './accessibility'

export { default as accessibilityStyles } from '../styles/accessibility.module.scss'
