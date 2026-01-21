import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Database,
  HardDrive,
  Cloud,
  Download,
  Upload,
  CircleNotch,
  CloudArrowUp,
} from '@phosphor-icons/react'
import { storageSettingsCopy, getBackendCopy, type StorageBackendKey } from '@/components/storage/storageSettingsConfig'
import { useStorageSettingsHandlers } from '@/components/storage/useStorageSettingsHandlers'

const getBackendIcon = (backend: StorageBackendKey | null) => {
  switch (backend) {
    case 'flask':
      return <CloudArrowUp className="w-5 h-5" />
    case 'sqlite':
      return <HardDrive className="w-5 h-5" />
    case 'indexeddb':
      return <Database className="w-5 h-5" />
    case 'sparkkv':
      return <Cloud className="w-5 h-5" />
    default:
      return <Database className="w-5 h-5" />
  }
}

const StorageSettingsPanelHeader = ({ description }: { description: string }) => (
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Database className="w-5 h-5" />
      {storageSettingsCopy.panel.title}
    </CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
)

const BackendStatusSummary = ({ backend }: { backend: StorageBackendKey | null }) => {
  const backendCopy = getBackendCopy(backend)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{storageSettingsCopy.panel.currentBackendLabel}</span>
          {getBackendIcon(backend)}
          <span className="text-sm">{backendCopy.panelLabel}</span>
        </div>
        <Badge variant="secondary">{backend?.toUpperCase() || backendCopy.badgeLabel.toUpperCase()}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{backendCopy.panelDescription}</p>
    </div>
  )
}

type BackendSwitcherProps = {
  backend: StorageBackendKey | null
  flaskUrl: string
  isSwitching: boolean
  onFlaskUrlChange: (value: string) => void
  onSwitchToIndexedDB: () => void
  onSwitchToFlask: () => void
  onSwitchToSQLite: () => void
}

const BackendSwitcher = ({
  backend,
  flaskUrl,
  isSwitching,
  onFlaskUrlChange,
  onSwitchToIndexedDB,
  onSwitchToFlask,
  onSwitchToSQLite,
}: BackendSwitcherProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium">{storageSettingsCopy.panel.switchTitle}</h3>

    <div className="space-y-3">
      <div>
        <Label htmlFor="flask-url" className="text-sm">
          {storageSettingsCopy.panel.flaskUrlLabel}
        </Label>
        <Input
          id="flask-url"
          type="text"
          value={flaskUrl}
          onChange={(e) => onFlaskUrlChange(e.target.value)}
          placeholder={storageSettingsCopy.panel.flaskUrlPlaceholder}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">{storageSettingsCopy.panel.flaskUrlHelp}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onSwitchToIndexedDB}
        disabled={backend === 'indexeddb' || isSwitching}
        variant={backend === 'indexeddb' ? 'default' : 'outline'}
        size="sm"
      >
        {isSwitching ? (
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Database className="w-4 h-4 mr-2" />
        )}
        {storageSettingsCopy.panel.buttons.indexeddb}
      </Button>
      <Button
        onClick={onSwitchToFlask}
        disabled={backend === 'flask' || isSwitching}
        variant={backend === 'flask' ? 'default' : 'outline'}
        size="sm"
      >
        {isSwitching ? (
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CloudArrowUp className="w-4 h-4 mr-2" />
        )}
        {storageSettingsCopy.panel.buttons.flask}
      </Button>
      <Button
        onClick={onSwitchToSQLite}
        disabled={backend === 'sqlite' || isSwitching}
        variant={backend === 'sqlite' ? 'default' : 'outline'}
        size="sm"
      >
        {isSwitching ? (
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <HardDrive className="w-4 h-4 mr-2" />
        )}
        {storageSettingsCopy.panel.buttons.sqlite}
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">{storageSettingsCopy.panel.switchHelp}</p>
  </div>
)

type DataManagementSectionProps = {
  isExporting: boolean
  isImporting: boolean
  onExport: () => void
  onImport: () => void
}

const DataManagementSection = ({
  isExporting,
  isImporting,
  onExport,
  onImport,
}: DataManagementSectionProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium">{storageSettingsCopy.panel.dataTitle}</h3>
    <div className="flex flex-wrap gap-2">
      <Button onClick={onExport} disabled={isExporting} variant="outline" size="sm">
        {isExporting ? (
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {storageSettingsCopy.panel.buttons.export}
      </Button>
      <Button onClick={onImport} disabled={isImporting} variant="outline" size="sm">
        {isImporting ? (
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {storageSettingsCopy.panel.buttons.import}
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">{storageSettingsCopy.panel.dataHelp}</p>
  </div>
)

export function StorageSettingsPanel() {
  const {
    backend,
    isLoading,
    flaskUrl,
    setFlaskUrl,
    isSwitching,
    handleSwitchToFlask,
    handleSwitchToSQLite,
    handleSwitchToIndexedDB,
    isExporting,
    isImporting,
    handleExport,
    handleImport,
  } = useStorageSettingsHandlers({
    defaultFlaskUrl: storageSettingsCopy.panel.flaskUrlPlaceholder,
    exportFilename: () => {
      const dateStamp = new Date().toISOString().split('T')[0]
      return `${storageSettingsCopy.panel.exportFilenamePrefix}-${dateStamp}.json`
    },
    importAccept: 'application/json',
  })

  if (isLoading && !backend) {
    return (
      <Card>
        <StorageSettingsPanelHeader description={storageSettingsCopy.panel.loadingDescription} />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <CircleNotch className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <StorageSettingsPanelHeader description={storageSettingsCopy.panel.description} />
      <CardContent className="space-y-6">
        <BackendStatusSummary backend={backend} />
        <BackendSwitcher
          backend={backend}
          flaskUrl={flaskUrl}
          isSwitching={isSwitching}
          onFlaskUrlChange={setFlaskUrl}
          onSwitchToIndexedDB={handleSwitchToIndexedDB}
          onSwitchToFlask={handleSwitchToFlask}
          onSwitchToSQLite={handleSwitchToSQLite}
        />
        <DataManagementSection
          isExporting={isExporting}
          isImporting={isImporting}
          onExport={handleExport}
          onImport={handleImport}
        />
      </CardContent>
    </Card>
  )
}
