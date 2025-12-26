import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SaveIcon from '@mui/icons-material/Save'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import type { FileNode } from '@/lib/nerd-mode-ide'

interface NerdModeEditorHeaderProps {
  selectedFile: FileNode
  isRunning: boolean
  onRunCode: () => void
  onSave: () => void
  onDelete: () => void
}

export function NerdModeEditorHeader({
  selectedFile,
  isRunning,
  onRunCode,
  onSave,
  onDelete,
}: NerdModeEditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted border-b border-border">
      <div className="flex items-center gap-2">
        <DescriptionOutlinedIcon fontSize="small" />
        <span className="text-sm font-medium">{selectedFile.name}</span>
        <Badge variant="outline" className="text-xs">
          {selectedFile.language || 'text'}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onRunCode} disabled={isRunning}>
          <PlayArrowIcon fontSize="small" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onSave}>
          <SaveIcon fontSize="small" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <DeleteOutlineIcon fontSize="small" />
        </Button>
      </div>
    </div>
  )
}
