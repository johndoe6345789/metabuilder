import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import SettingsIcon from '@mui/icons-material/Settings'
import TerminalIcon from '@mui/icons-material/Terminal'
import { Button } from '@/components/ui'
import { CardHeader, CardTitle } from '@/components/ui'

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
          <TerminalIcon fontSize="small" />
          Nerd Mode IDE
          <span className="text-sm text-muted-foreground">· {workspaceName}</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onOpenGitConfig}>
            <SettingsIcon fontSize="small" />
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenTemplates}>
            <AutoAwesomeIcon fontSize="small" />
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenNewItem}>
            <LibraryAddIcon fontSize="small" />
          </Button>
          <Button size="sm" variant="outline" onClick={onExportZip}>
            <CloudDownloadIcon fontSize="small" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
