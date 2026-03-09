import { Button } from '@metabuilder/fakemui/inputs'
import { Copy, Eraser, PencilSimple, Plus, Trash } from '@metabuilder/fakemui/icons'
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
  <div>
    <div>
      <div>
        <Button variant="outlined" size="small" onClick={onNewDesign}>
          <Plus size={16} />
          {copy.toolbar.newDesign}
        </Button>
        <Button variant="outlined" size="small" onClick={onDuplicateDesign}>
          <Copy size={16} />
          {copy.toolbar.duplicate}
        </Button>
        <Button variant="outlined" size="small" onClick={onDeleteDesign} disabled={!canDelete}>
          <Trash size={16} />
          {copy.toolbar.delete}
        </Button>
      </div>
      <div>
        <Button variant={drawMode === 'select' ? 'filled' : 'outlined'} size="small" onClick={onSelectMode}>
          {copy.modes.select}
        </Button>
        <Button variant={drawMode === 'draw' ? 'filled' : 'outlined'} size="small" onClick={onDrawMode}>
          <PencilSimple size={16} />
          {copy.modes.draw}
        </Button>
        <Button variant={drawMode === 'erase' ? 'filled' : 'outlined'} size="small" onClick={onEraseMode}>
          <Eraser size={16} />
          {copy.modes.erase}
        </Button>
      </div>
    </div>
  </div>
)
