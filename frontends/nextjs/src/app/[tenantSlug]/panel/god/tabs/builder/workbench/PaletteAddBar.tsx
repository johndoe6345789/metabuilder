'use client'

import { Button } from '@/m3'
import type { PaletteItem } from '../builder-registry'
import s from '../ComponentTreeTab.module.scss'

/** Appears once a block is staged (see use-pending-add.ts) -- opens the
 *  dialog that picks where in the tree it lands. */
export function PaletteAddBar({
  item,
  onRequestAdd,
}: {
  item: PaletteItem
  onRequestAdd: () => void
}) {
  return (
    <div className={s.palAddBar}>
      <Button variant="contained" fullWidth onClick={onRequestAdd}>
        Add {item.name}
      </Button>
    </div>
  )
}
