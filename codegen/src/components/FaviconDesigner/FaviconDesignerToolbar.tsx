import { Button } from '@/components/ui/button'
import { Copy, Eraser, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import copy from '@/data/favicon-designer.json'

type FaviconDesignerToolbarProps = {
  drawMode: 'select' | 'draw' | 'erase'
  canDelete: boolean
  onNewDesign: () => void
  onDuplicateDesign: () => void
  onDeleteDesign: () => void
  onSelectMode: () => void
  onDrawMode: () => void
  onEraseMode: () => void
}

export const FaviconDesignerToolbar = ({
  drawMode,
  canDelete,
  onNewDesign,
  onDuplicateDesign,
  onDeleteDesign,
  onSelectMode,
  onDrawMode,
  onEraseMode,
}: FaviconDesignerToolbarProps) => (
  <div className="border-b border-border bg-card px-4 sm:px-6 py-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onNewDesign}>
          <Plus size={16} className="mr-2" />
          {copy.toolbar.newDesign}
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicateDesign}>
          <Copy size={16} className="mr-2" />
          {copy.toolbar.duplicate}
        </Button>
        <Button variant="outline" size="sm" onClick={onDeleteDesign} disabled={!canDelete}>
          <Trash size={16} className="mr-2" />
          {copy.toolbar.delete}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant={drawMode === 'select' ? 'default' : 'outline'} size="sm" onClick={onSelectMode}>
          {copy.modes.select}
        </Button>
        <Button variant={drawMode === 'draw' ? 'default' : 'outline'} size="sm" onClick={onDrawMode}>
          <PencilSimple size={16} className="mr-2" />
          {copy.modes.draw}
        </Button>
        <Button variant={drawMode === 'erase' ? 'default' : 'outline'} size="sm" onClick={onEraseMode}>
          <Eraser size={16} className="mr-2" />
          {copy.modes.erase}
        </Button>
      </div>
    </div>
  </div>
)
