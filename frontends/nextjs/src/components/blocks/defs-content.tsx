'use client'

/** Content blocks, split across files to keep each one small. */

import type { BlockDef } from './block-types'
import { CONTENT_DEFS_1 } from './defs-content-1'
import { CONTENT_DEFS_2 } from './defs-content-2'

export const CONTENT_DEFS: BlockDef[] = [
  ...CONTENT_DEFS_1,
  ...CONTENT_DEFS_2,
]
