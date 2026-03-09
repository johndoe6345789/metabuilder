import { Badge, Separator } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { ArrowsClockwise, CheckCircle, Clock, CloudArrowDown, CloudArrowUp, XCircle } from '@metabuilder/fakemui/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { DBALSyncStatus } from '@/store/slices/dbalSlice'

type SyncStatusCardProps = {
  status: DBALSyncStatus
  lastSyncedAt: number | null
  autoSyncEnabled: boolean
  dbalConnected: boolean
  onSyncUp: () => void
  onSyncDown: () => void
}

export function SyncStatusCard({
  status,
  lastSyncedAt,
  autoSyncEnabled,
  dbalConnected,
  onSyncUp,
  onSyncDown,
}: SyncStatusCardProps) {
  const getSyncStatusBadge = () => {
    switch (status) {
      case 'idle':
        return <Badge variant="outlined">{reduxIntegrationCopy.cards.sync.status.idle}</Badge>
      case 'syncing':
        return (
          <Badge variant="tonal">
            {reduxIntegrationCopy.cards.sync.status.syncing}
          </Badge>
        )
      case 'success':
        return (
          <Badge variant="filled">
            <CheckCircle />
            {reduxIntegrationCopy.cards.sync.status.success}
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="danger">
            <XCircle />
            {reduxIntegrationCopy.cards.sync.status.error}
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ArrowsClockwise />
          {reduxIntegrationCopy.cards.sync.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.sync.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <span>
            {reduxIntegrationCopy.cards.sync.labels.status}
          </span>
          {getSyncStatusBadge()}
        </div>
        <div>
          <span>
            {reduxIntegrationCopy.cards.sync.labels.autoSync}
          </span>
          <Badge variant={autoSyncEnabled ? 'filled' : 'outlined'}>
            {autoSyncEnabled
              ? reduxIntegrationCopy.cards.sync.autoSync.enabled
              : reduxIntegrationCopy.cards.sync.autoSync.disabled}
          </Badge>
        </div>
        {lastSyncedAt && (
          <div>
            <span>
              {reduxIntegrationCopy.cards.sync.labels.lastSync}
            </span>
            <Badge variant="outlined">
              <Clock />
              {new Date(lastSyncedAt).toLocaleTimeString()}
            </Badge>
          </div>
        )}
        <Separator />
        <div>
          <Button
            onClick={onSyncUp}
            variant="outlined"
            size="small"
            disabled={!dbalConnected || status === 'syncing'}
          >
            <CloudArrowUp />
            {reduxIntegrationCopy.cards.sync.labels.push}
          </Button>
          <Button
            onClick={onSyncDown}
            variant="outlined"
            size="small"
            disabled={!dbalConnected || status === 'syncing'}
          >
            <CloudArrowDown />
            {reduxIntegrationCopy.cards.sync.labels.pull}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
