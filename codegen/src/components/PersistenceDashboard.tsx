import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Database,
  CloudArrowUp,
  CloudArrowDown,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Clock,
  ChartLine,
  Gauge,
} from '@phosphor-icons/react'
import { usePersistence } from '@/hooks/use-persistence'
import { usePersistenceDashboard } from '@/hooks/use-persistence-dashboard'
import copy from '@/data/persistence-dashboard.json'

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

type PersistenceStatus = ReturnType<typeof usePersistence>['status']

type PersistenceMetrics = ReturnType<typeof usePersistence>['metrics']

type AutoSyncStatus = ReturnType<typeof usePersistence>['autoSyncStatus']

const getStatusColor = (status: PersistenceStatus) => {
  if (!status.flaskConnected) return 'bg-destructive'
  if (status.syncStatus === 'syncing') return 'bg-amber-500'
  if (status.syncStatus === 'success') return 'bg-accent'
  if (status.syncStatus === 'error') return 'bg-destructive'
  return 'bg-muted'
}

const getStatusText = (status: PersistenceStatus) => {
  if (!status.flaskConnected) return copy.status.disconnected
  if (status.syncStatus === 'syncing') return copy.status.syncing
  if (status.syncStatus === 'success') return copy.status.synced
  if (status.syncStatus === 'error') return copy.status.error
  return copy.status.idle
}

const formatTime = (timestamp: number | null) => {
  if (!timestamp) return copy.format.never
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

const getSuccessRate = (metrics: PersistenceMetrics) => {
  if (metrics.totalOperations === 0) return 0
  return Math.round((metrics.successfulOperations / metrics.totalOperations) * 100)
}

type HeaderProps = {
  status: PersistenceStatus
}

const DashboardHeader = ({ status }: HeaderProps) => (
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">{copy.title}</h1>
    <Badge className={`${getStatusColor(status)} text-white`}>
      {getStatusText(status)}
    </Badge>
  </div>
)

type ConnectionStatusCardProps = {
  status: PersistenceStatus
}

const ConnectionStatusCard = ({ status }: ConnectionStatusCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border hover:bg-muted/50 transition-colors">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Database className="text-primary" />
        {copy.cards.connection.title}
      </h3>
      {status.flaskConnected ? (
        <CheckCircle className="text-accent" weight="fill" />
      ) : (
        <XCircle className="text-destructive" weight="fill" />
      )}
    </div>
    <Separator />
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.connection.localStorageLabel}</span>
        <span className="font-medium">{copy.cards.connection.localStorageValue}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.connection.remoteStorageLabel}</span>
        <span className="font-medium">
          {status.flaskConnected
            ? copy.cards.connection.remoteStorageConnected
            : copy.cards.connection.remoteStorageDisconnected}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.connection.lastSyncLabel}</span>
        <span className="font-medium">{formatTime(status.lastSyncTime)}</span>
      </div>
    </div>
  </Card>
)

type SyncMetricsCardProps = {
  metrics: PersistenceMetrics
}

const SyncMetricsCard = ({ metrics }: SyncMetricsCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border hover:bg-muted/50 transition-colors">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ChartLine className="text-accent" />
        {copy.cards.metrics.title}
      </h3>
      <Gauge className="text-muted-foreground" />
    </div>
    <Separator />
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.metrics.totalOperationsLabel}</span>
        <span className="font-medium">{metrics.totalOperations}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.metrics.successRateLabel}</span>
        <span className="font-medium text-accent">{getSuccessRate(metrics)}%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.metrics.avgDurationLabel}</span>
        <span className="font-medium">{formatDuration(metrics.averageOperationTime)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.metrics.failedLabel}</span>
        <span className="font-medium text-destructive">{metrics.failedOperations}</span>
      </div>
    </div>
  </Card>
)

type AutoSyncCardProps = {
  autoSyncStatus: AutoSyncStatus
  autoSyncEnabled: boolean
  onToggle: (enabled: boolean) => void
}

const AutoSyncCard = ({ autoSyncStatus, autoSyncEnabled, onToggle }: AutoSyncCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border hover:bg-muted/50 transition-colors">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="text-amber-500" />
        {copy.cards.autoSync.title}
      </h3>
      <Switch checked={autoSyncEnabled} onCheckedChange={onToggle} />
    </div>
    <Separator />
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.autoSync.statusLabel}</span>
        <span className="font-medium">
          {autoSyncStatus.enabled
            ? copy.cards.autoSync.statusEnabled
            : copy.cards.autoSync.statusDisabled}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.autoSync.changesPendingLabel}</span>
        <span className="font-medium">{autoSyncStatus.changeCounter}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{copy.cards.autoSync.nextSyncLabel}</span>
        <span className="font-medium">
          {autoSyncStatus.nextSyncIn !== null
            ? formatDuration(autoSyncStatus.nextSyncIn)
            : copy.cards.autoSync.nextSyncNotAvailable}
        </span>
      </div>
    </div>
  </Card>
)

type ManualSyncCardProps = {
  onSyncToFlask: () => void
  onSyncFromFlask: () => void
  onManualSync: () => void
  onCheckConnection: () => void
  canSyncToFlask: boolean
  canSyncFromFlask: boolean
  canTriggerManualSync: boolean
}

const ManualSyncCard = ({
  onSyncToFlask,
  onSyncFromFlask,
  onManualSync,
  onCheckConnection,
  canSyncToFlask,
  canSyncFromFlask,
  canTriggerManualSync,
}: ManualSyncCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <ArrowsClockwise className="text-primary" />
      {copy.cards.manualSync.title}
    </h3>
    <Separator />
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onSyncToFlask}
        disabled={!canSyncToFlask}
        className="flex items-center gap-2"
      >
        <CloudArrowUp />
        {copy.cards.manualSync.pushButton}
      </Button>
      <Button
        onClick={onSyncFromFlask}
        disabled={!canSyncFromFlask}
        variant="outline"
        className="flex items-center gap-2"
      >
        <CloudArrowDown />
        {copy.cards.manualSync.pullButton}
      </Button>
      <Button
        onClick={onManualSync}
        disabled={!canTriggerManualSync}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowsClockwise />
        {copy.cards.manualSync.triggerButton}
      </Button>
      <Button
        onClick={onCheckConnection}
        variant="outline"
        className="flex items-center gap-2"
      >
        <CheckCircle />
        {copy.cards.manualSync.checkButton}
      </Button>
    </div>
  </Card>
)

type SyncErrorCardProps = {
  error: string
}

const SyncErrorCard = ({ error }: SyncErrorCardProps) => (
  <Card className="p-6 border-destructive bg-destructive/10">
    <div className="flex items-start gap-3">
      <XCircle className="text-destructive mt-1" weight="fill" />
      <div>
        <h3 className="font-semibold text-destructive mb-1">{copy.cards.error.title}</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  </Card>
)

const HowPersistenceWorksCard = () => (
  <Card className="p-6 space-y-4 border-sidebar-border">
    <h3 className="text-lg font-semibold">{copy.cards.howItWorks.title}</h3>
    <Separator />
    <div className="space-y-3 text-sm text-muted-foreground">
      {copy.cards.howItWorks.items.map((item) => (
        <p key={item.title}>
          <strong className="text-foreground">{item.title}</strong> {item.description}
        </p>
      ))}
    </div>
  </Card>
)

export function PersistenceDashboard() {
  const {
    status,
    metrics,
    autoSyncStatus,
    autoSyncEnabled,
    flags,
    handlers,
  } = usePersistenceDashboard()

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader status={status} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConnectionStatusCard status={status} />
        <SyncMetricsCard metrics={metrics} />
        <AutoSyncCard
          autoSyncStatus={autoSyncStatus}
          autoSyncEnabled={autoSyncEnabled}
          onToggle={handlers.handleAutoSyncToggle}
        />
      </div>

      <ManualSyncCard
        onSyncToFlask={handlers.handleSyncToFlask}
        onSyncFromFlask={handlers.handleSyncFromFlask}
        onManualSync={handlers.handleManualSync}
        onCheckConnection={handlers.handleCheckConnection}
        canSyncToFlask={flags.canSyncToFlask}
        canSyncFromFlask={flags.canSyncFromFlask}
        canTriggerManualSync={flags.canTriggerManualSync}
      />

      {flags.hasError && status.error && <SyncErrorCard error={status.error} />}

      <HowPersistenceWorksCard />
    </div>
  )
}
