import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash } from '@phosphor-icons/react'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'

type DangerZoneCardProps = {
  flaskConnected: boolean
  onClearFlask: () => void
}

export function DangerZoneCard({ flaskConnected, onClearFlask }: DangerZoneCardProps) {
  return (
    <Card className="mt-6 border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{reduxIntegrationCopy.danger.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.danger.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onClearFlask} disabled={!flaskConnected}>
          <Trash className="w-4 h-4 mr-2" />
          {reduxIntegrationCopy.danger.clearButton}
        </Button>
      </CardContent>
    </Card>
  )
}
