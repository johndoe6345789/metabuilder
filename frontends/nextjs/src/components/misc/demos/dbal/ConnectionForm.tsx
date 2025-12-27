import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui'

interface ConnectionFormProps {
  defaultUrl?: string
  defaultApiKey?: string
  isConnecting?: boolean
  statusMessage?: string
  onConnect?: (config: { endpoint: string; apiKey: string }) => void
}

export function ConnectionForm({
  defaultUrl = '',
  defaultApiKey = '',
  isConnecting = false,
  statusMessage,
  onConnect,
}: ConnectionFormProps) {
  const [endpoint, setEndpoint] = useState(defaultUrl)
  const [apiKey, setApiKey] = useState(defaultApiKey)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onConnect?.({ endpoint, apiKey })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DBAL Connection</CardTitle>
        <CardDescription>Configure the DBAL endpoint used by the demos</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="dbal-endpoint">Endpoint</Label>
            <Input
              id="dbal-endpoint"
              placeholder="http://localhost:8080/api/dbal"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbal-api-key">API Key</Label>
            <Input
              id="dbal-api-key"
              type="password"
              placeholder="Optional"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isConnecting}>
              {isConnecting ? 'Connecting…' : 'Connect'}
            </Button>
            {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
