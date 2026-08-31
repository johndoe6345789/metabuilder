'use client'

/**
 * The Styles tab in plain English.
 *
 * A style is stored as CSS declarations, but nobody should have to know that
 * to use it: every control below names what it *does* ("Space inside") rather
 * than the property it writes (padding), and offers the handful of values
 * that are actually useful instead of a free-text box that accepts anything.
 *
 * Each control owns exactly one CSS property, so the stored shape stays a
 * plain Record<string, string> and anything typed in the Advanced editor
 * shows up in these controls too.
 */

export type { StyleControl, StyleGroup } from './style-controls/types'
export {
  THEME_COLORS,
  themeColorValue,
} from './style-controls/theme-colors'
export { STYLE_GROUPS, MANAGED_PROPS } from './style-controls/groups'
export { toClassName } from './style-controls/to-class-name'
export { toCssProp, toCssText } from '@/lib/tenant/style-classes'
