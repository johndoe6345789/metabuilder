import { Button } from '@/components/ui'
import { CardHeader, CardTitle } from '@/components/ui'
import { AutoAwesome, CloudDownload, LibraryAdd, Settings, Terminal } from '@/fakemui/icons'

interface NerdModeIDEHeaderProps {
  workspaceName: string
  onOpenGitConfig: () => void
  onOpenNewItem: () => void
  onOpenTemplates: () => void
  onExportZip: () => void
}

export function NerdModeIDEHeader({
  workspaceName,
  onOpenGitConfig,
  onOpenNewItem,
  onOpenTemplates,
  onExportZip,
}: NerdModeIDEHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Terminal size={16} />
          Nerd Mode IDE
          <span className="text-sm text-muted-foreground">- {workspaceName}</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onOpenGitConfig}>
            <Settings size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenTemplates}>
            <AutoAwesome size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenNewItem}>
            <LibraryAdd size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={onExportZip}>
            <CloudDownload size={16} />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
