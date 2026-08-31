/**
 * Read and write a tenant's named CSS classes as rows.
 *
 * A style sheet is StyleClass (identity) + StyleRule (one named class) +
 * StyleRuleProp (one declaration). The Styles tab used to POST the whole set
 * as a `classes` JSON string on StyleClass; that column no longer exists, so
 * this replaces it with the same relational shape the page trees use.
 */

export type { StyleClassShape } from './style-classes/types'
export { loadStyleClasses } from './style-classes/load-style-classes'
export { saveStyleClasses } from './style-classes/save-style-classes'
export { toCssProp, toCssText } from './style-classes/css-text'
export { styleSheetText } from './style-classes/style-sheet-text'
