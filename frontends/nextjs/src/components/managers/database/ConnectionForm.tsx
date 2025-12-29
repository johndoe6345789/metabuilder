import { useState, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'

export interface ConnectionDetails {
  driver: string
  host: string
  port: string
  database: string
  username: string
  password: string
}

interface ConnectionFormProps {
  onConnect: (details: ConnectionDetails) => Promise<void> | void
  isConnecting?: boolean
  status: 'disconnected' | 'connecting' | 'connected'
  lastConnectedAt: Date | null
}

export function ConnectionForm({
  onConnect,
  isConnecting,
  status,
  lastConnectedAt,
}: ConnectionFormProps) {
  const [details, setDetails] = useState<ConnectionDetails>({
    driver: 'prisma-client',
    host: 'localhost',
    port: '5432',
    database: 'metabuilder',
    username: 'admin',
    password: '',
  })

  const handleChange = (key: keyof ConnectionDetails, value: string) => {
    setDetails(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await onConnect(details)
  }

  const statusVariant =
    status === 'connected' ? 'default' : status === 'connecting' ? 'secondary' : 'outline'
  const statusLabel =
    status === 'connected'
      ? 'Connected'
      : status === 'connecting'
        ? 'Connecting...'
        : 'Not connected'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Connection</CardTitle>
          <CardDescription>Initialize and validate access to the database layer</CardDescription>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <Input
              id="driver"
              value={details.driver}
              onChange={e => handleChange('driver', e.target.value)}
              placeholder="prisma-client"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              value={details.database}
              onChange={e => handleChange('database', e.target.value)}
              placeholder="metabuilder"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={details.host}
              onChange={e => handleChange('host', e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={details.port}
              onChange={e => handleChange('port', e.target.value)}
              placeholder="5432"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={details.username}
              onChange={e => handleChange('username', e.target.value)}
              placeholder="admin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={details.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {lastConnectedAt
                ? `Last connected ${lastConnectedAt.toLocaleString()}`
                : 'No connection established yet.'}
            </div>
            <Button type="submit" disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Initialize'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
