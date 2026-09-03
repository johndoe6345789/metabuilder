'use client'

import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@/m3'
import { paletteItem, type TreeNode } from '../builder-registry'
import { TreeTargetPicker } from './TreeTargetPicker'

type Props = {
  open: boolean
  pendingType: string | null
  tree: TreeNode
  defaultTargetId: string
  onClose: () => void
  onConfirm: (targetId: string) => void
}

/**
 * Where does this block go? Reuses addNode's own targeting rule (land
 * inside the picked node if it can hold children, otherwise beside it) --
 * picking a row here is exactly what dropping the palette item on that row
 * already does, just without a drag.
 */
export function AddBlockDialog({
  open,
  pendingType,
  tree,
  defaultTargetId,
  onClose,
  onConfirm,
}: Props) {
  const [pickedId, setPickedId] = useState(defaultTargetId)
  const item = pendingType === null ? null : paletteItem(pendingType)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add {item?.name ?? 'block'}</DialogTitle>
      <DialogContent>
        <TreeTargetPicker
          node={tree}
          pickedId={pickedId}
          onPick={setPickedId}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            onConfirm(pickedId)
          }}
        >
          Add here
        </Button>
      </DialogActions>
    </Dialog>
  )
}
