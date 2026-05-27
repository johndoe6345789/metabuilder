/**
 * JSON components barrel — re-exports from focused category files.
 * Split to comply with ≤100 LOC per file rule.
 *
 * Utility:    json-components-utility.ts
 * Layout:     json-components-layout.ts
 * Form:       json-components-form.ts
 * Display:    json-components-display.ts
 * Navigation: json-components-nav.ts
 * Widget:     json-components-widget.ts
 * Page:       json-components-page.ts
 */

export * from './json-components-utility'
export * from './json-components-layout'
export * from './json-components-form'
export * from './json-components-display'
export * from './json-components-nav'
export * from './json-components-widget'
export * from './json-components-page'

// Pagination — kept here to preserve the short alias used in existing code
import { createJsonComponent } from './create-json-component'
import type { PaginationProps } from './interfaces'
import paginationDef from '@/components/json-definitions/pagination.json'
export const Pagination =
  createJsonComponent<PaginationProps>(paginationDef)

// Dialog — short alias
import type { DialogProps } from './interfaces'
import dialogDef from '@/components/json-definitions/dialog.json'
export const Dialog = createJsonComponent<DialogProps>(dialogDef)
