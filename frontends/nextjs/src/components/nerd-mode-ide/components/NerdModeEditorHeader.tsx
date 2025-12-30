import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { DeleteOutline, DescriptionOutlined, PlayArrow, Save } from '@/fakemui/icons'
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
        <DescriptionOutlined size={16} />
        <span className="text-sm font-medium">{selectedFile.name}</span>
        <Badge variant="outline" className="text-xs">
          {selectedFile.language || 'text'}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onRunCode} disabled={isRunning}>
          <PlayArrow size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={onSave}>
          <Save size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <DeleteOutline size={16} />
        </Button>
      </div>
    </div>
  )
}
