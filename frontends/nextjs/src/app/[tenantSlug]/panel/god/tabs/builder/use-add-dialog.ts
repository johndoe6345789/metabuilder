'use client'

import { useState } from 'react'
import { usePendingAdd } from './use-pending-add'

/** Owns the staged block type and the placement dialog's open state
 *  together, since confirming the dialog is what finally applies the
 *  staged choice and clears it -- see use-pending-add.ts for why a click
 *  no longer inserts a block on its own. */
type AddNode = (type: string, parentId: string) => void

export function useAddDialog(addNode: AddNode) {
  const pending = usePendingAdd()
  const [open, setOpen] = useState(false)

  return {
    pendingType: pending.pendingType,
    selectType: pending.select,
    open,
    openDialog: () => {
      setOpen(true)
    },
    closeDialog: () => {
      setOpen(false)
    },
    confirm: (targetId: string) => {
      if (pending.pendingType !== null) addNode(pending.pendingType, targetId)
      pending.clear()
      setOpen(false)
    },
  }
}
