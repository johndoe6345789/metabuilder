'use client'

/**
 * Every block type, assembled from the per-category tables.
 *
 * Split by category so no single file carries the whole catalog; adding a
 * block means editing one category file and nothing else.
 */

import type { BlockDef } from './block-types'
import { CONTENT_DEFS } from './defs-content'
import { FEEDBACK_DEFS } from './defs-feedback'
import { HTML_DEFS } from './defs-html'
import { INPUTS_DEFS } from './defs-inputs'
import { LAYOUT_DEFS } from './defs-layout'
import { MISC_DEFS } from './defs-misc'
import { NAVIGATION_DEFS } from './defs-navigation'

export const DEFS: BlockDef[] = [
  ...CONTENT_DEFS,
  ...FEEDBACK_DEFS,
  ...HTML_DEFS,
  ...INPUTS_DEFS,
  ...LAYOUT_DEFS,
  ...MISC_DEFS,
  ...NAVIGATION_DEFS,
]
