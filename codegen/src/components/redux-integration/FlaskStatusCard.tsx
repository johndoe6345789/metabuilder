import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowsClockwise, CheckCircle, CloudArrowUp, XCircle } from '@phosphor-icons/react'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
type FlaskStats = {
  totalKeys: number
  totalSizeBytes: number
} | null

type FlaskStatusCardProps = {
  flaskConnected: boolean
  flaskStats: FlaskStats
  onCheckConnection: () => void
}

export function FlaskStatusCard({ flaskConnected, flaskStats, onCheckConnection }: FlaskStatusCardProps) {
  const connectionLabel = flaskConnected
    ? reduxIntegrationCopy.cards.flask.status.connected
    : reduxIntegrationCopy.cards.flask.status.disconnected

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudArrowUp className="w-5 h-5" />
          {reduxIntegrationCopy.cards.flask.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.flask.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {reduxIntegrationCopy.cards.flask.labels.connection}
          </span>
          {flaskConnected ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              {connectionLabel}
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              {connectionLabel}
            </Badge>
          )}
        </div>
        {flaskStats && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {reduxIntegrationCopy.cards.flask.labels.totalKeys}
              </span>
              <Badge variant="outline">{flaskStats.totalKeys}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {reduxIntegrationCopy.cards.flask.labels.storageSize}
              </span>
              <Badge variant="outline">
                {(flaskStats.totalSizeBytes / 1024).toFixed(2)}{' '}
                {reduxIntegrationCopy.cards.flask.labels.storageUnit}
              </Badge>
            </div>
          </>
        )}
        <Separator />
        <Button onClick={onCheckConnection} variant="outline" size="sm" className="w-full">
          <ArrowsClockwise className="w-4 h-4 mr-2" />
          {reduxIntegrationCopy.cards.flask.labels.checkConnection}
        </Button>
      </CardContent>
    </Card>
  )
}
