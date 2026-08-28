'use client'

/** Layout blocks, split across files to keep each one small. */

import type { BlockDef } from './block-types'
import { LAYOUT_DEFS_1 } from './defs-layout-1'
import { LAYOUT_DEFS_2 } from './defs-layout-2'

export const LAYOUT_DEFS: BlockDef[] = [
  ...LAYOUT_DEFS_1,
  ...LAYOUT_DEFS_2,
]
