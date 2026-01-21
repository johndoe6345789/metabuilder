import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowsClockwise, CheckCircle, Clock, CloudArrowDown, CloudArrowUp, XCircle } from '@phosphor-icons/react'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { SyncStatus } from '@/store/slices/syncSlice'

type SyncStatusCardProps = {
  status: SyncStatus
  lastSyncedAt: number | null
  autoSyncEnabled: boolean
  flaskConnected: boolean
  onSyncUp: () => void
  onSyncDown: () => void
}

export function SyncStatusCard({
  status,
  lastSyncedAt,
  autoSyncEnabled,
  flaskConnected,
  onSyncUp,
  onSyncDown,
}: SyncStatusCardProps) {
  const getSyncStatusBadge = () => {
    switch (status) {
      case 'idle':
        return <Badge variant="outline">{reduxIntegrationCopy.cards.sync.status.idle}</Badge>
      case 'syncing':
        return (
          <Badge variant="secondary" className="animate-pulse">
            {reduxIntegrationCopy.cards.sync.status.syncing}
          </Badge>
        )
      case 'success':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {reduxIntegrationCopy.cards.sync.status.success}
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {reduxIntegrationCopy.cards.sync.status.error}
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5" />
          {reduxIntegrationCopy.cards.sync.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.sync.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {reduxIntegrationCopy.cards.sync.labels.status}
          </span>
          {getSyncStatusBadge()}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {reduxIntegrationCopy.cards.sync.labels.autoSync}
          </span>
          <Badge variant={autoSyncEnabled ? 'default' : 'outline'}>
            {autoSyncEnabled
              ? reduxIntegrationCopy.cards.sync.autoSync.enabled
              : reduxIntegrationCopy.cards.sync.autoSync.disabled}
          </Badge>
        </div>
        {lastSyncedAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {reduxIntegrationCopy.cards.sync.labels.lastSync}
            </span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(lastSyncedAt).toLocaleTimeString()}
            </Badge>
          </div>
        )}
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={onSyncUp}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!flaskConnected || status === 'syncing'}
          >
            <CloudArrowUp className="w-4 h-4 mr-1" />
            {reduxIntegrationCopy.cards.sync.labels.push}
          </Button>
          <Button
            onClick={onSyncDown}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!flaskConnected || status === 'syncing'}
          >
            <CloudArrowDown className="w-4 h-4 mr-1" />
            {reduxIntegrationCopy.cards.sync.labels.pull}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
