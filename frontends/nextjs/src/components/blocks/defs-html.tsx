'use client'

/** HTML blocks, split across files to keep each one small. */

import type { BlockDef } from './block-types'
import { HTML_DEFS_1 } from './defs-html-1'
import { HTML_DEFS_2 } from './defs-html-2'

export const HTML_DEFS: BlockDef[] = [...HTML_DEFS_1, ...HTML_DEFS_2]
