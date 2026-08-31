import { useState } from 'react'
import { dropWhere, type DropWhere } from './component-tree-drop'

/** Drag payloads. A row carries a node id; a palette entry carries a type. */
export const NODE_MIME = 'text/node-id'
export const PALETTE_MIME = 'text/palette-type'

export interface UseOutlineDragArgs {
  nodeId: string
  onAdd: (type: string, parentId: string) => void
  onMove: (dragId: string, targetId: string, where: DropWhere) => void
}

/** The drag-start/over/leave/drop handlers for one outline row, plus which
 *  edge (or "into") it is currently hovering a drop over. */
export function useOutlineDrag({ nodeId, onAdd, onMove }: UseOutlineDragArgs) {
  const [dropping, setDropping] = useState<DropWhere | null>(null)

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(NODE_MIME, nodeId)
    event.dataTransfer.effectAllowed = 'copyMove'
  }

  const onDragOver = (event: React.DragEvent) => {
    // Without preventDefault the browser refuses the drop outright.
    event.preventDefault()
    // The root has no siblings to sit between, so it is only ever a
    // container to drop into.
    setDropping(nodeId === 'root' ? 'into' : dropWhere(event))
  }

  const onDragLeave = () => {
    setDropping(null)
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const where = dropping ?? 'into'
    setDropping(null)
    const paletteType = event.dataTransfer.getData(PALETTE_MIME)
    if (paletteType) {
      onAdd(paletteType, nodeId)
      return
    }
    const dragId = event.dataTransfer.getData(NODE_MIME)
    if (dragId) onMove(dragId, nodeId, where)
  }

  return { dropping, onDragStart, onDragOver, onDragLeave, onDrop }
}
