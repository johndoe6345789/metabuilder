import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Trash } from '@metabuilder/fakemui/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'

type DangerZoneCardProps = {
  flaskConnected: boolean
  onClearFlask: () => void
}

export function DangerZoneCard({ flaskConnected, onClearFlask }: DangerZoneCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{reduxIntegrationCopy.danger.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.danger.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="danger" onClick={onClearFlask} disabled={!flaskConnected}>
          <Trash />
          {reduxIntegrationCopy.danger.clearButton}
        </Button>
      </CardContent>
    </Card>
  )
}
