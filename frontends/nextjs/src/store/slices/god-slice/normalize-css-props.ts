import { initialState } from './initial-state'
import type { GodState } from './types'

/** Hyphenated CSS props a saved project may still carry, and the camelCase
 *  name `use-css-classes` actually reads. */
const HYPHEN_TO_CAMEL = new Map([
  ['border-radius', 'borderRadius'],
  ['font-size', 'fontSize'],
  ['font-weight', 'fontWeight'],
])

function migrateProps(
  props: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      HYPHEN_TO_CAMEL.get(key) ?? key,
      value,
    ])
  )
}

/** Backfills fields a project saved before this shape existed, and
 *  migrates any hyphenated CSS prop names to their camelCase form. */
export function normalizeCssProps(state: GodState): GodState {
  const persisted = state as Partial<GodState>
  return {
    ...initialState,
    ...state,
    dirty: { ...initialState.dirty, ...persisted.dirty },
    css: (persisted.css ?? initialState.css).map(cssClass => ({
      ...cssClass,
      props: migrateProps(cssClass.props),
    })),
  }
}
