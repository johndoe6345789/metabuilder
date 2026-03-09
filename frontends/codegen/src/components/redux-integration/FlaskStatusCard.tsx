import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ArrowsClockwise, CheckCircle, CloudArrowUp, XCircle } from '@metabuilder/fakemui/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import type { DBALConfigResponse } from '@/store/middleware/dbalSync'

type DBALStatusCardProps = {
  dbalConnected: boolean
  dbalStats: DBALConfigResponse | null
  onCheckConnection: () => void
}

export function DBALStatusCard({ dbalConnected, dbalStats, onCheckConnection }: DBALStatusCardProps) {
  const connectionLabel = dbalConnected
    ? reduxIntegrationCopy.cards.dbal.status.connected
    : reduxIntegrationCopy.cards.dbal.status.disconnected

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CloudArrowUp />
          {reduxIntegrationCopy.cards.dbal.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.dbal.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <span>
            {reduxIntegrationCopy.cards.dbal.labels.connection}
          </span>
          {dbalConnected ? (
            <Badge variant="filled">
              <CheckCircle />
              {connectionLabel}
            </Badge>
          ) : (
            <Badge variant="danger">
              <XCircle />
              {connectionLabel}
            </Badge>
          )}
        </div>
        {dbalStats && (
          <>
            <div>
              <span>Adapter</span>
              <Badge variant="outlined">{dbalStats.adapter}</Badge>
            </div>
            <div>
              <span>Status</span>
              <Badge variant="outlined">{dbalStats.status}</Badge>
            </div>
          </>
        )}
        <Separator />
        <Button onClick={onCheckConnection} variant="outlined" size="small">
          <ArrowsClockwise />
          {reduxIntegrationCopy.cards.dbal.labels.checkConnection}
        </Button>
      </CardContent>
    </Card>
  )
}
