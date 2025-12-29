import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type ConnectionStatus = 'idle' | 'connected' | 'error'

interface StatusCardProps {
  status: ConnectionStatus
  host?: string
  lastChecked?: string
  message?: string
}

const statusCopy: Record<ConnectionStatus, { label: string; tone: string; icon: ReactNode }> = {
  idle: {
    label: 'Not tested',
    tone: 'bg-muted text-muted-foreground',
    icon: <Clock size={16} />,
  },
  connected: {
    label: 'Connected',
    tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    icon: <CheckCircle size={16} />,
  },
  error: {
    label: 'Connection failed',
    tone: 'bg-destructive/15 text-destructive',
    icon: <WarningCircle size={16} />,
  },
}

export function StatusCard({ status, host, lastChecked, message }: StatusCardProps) {
  const copy = statusCopy[status]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Connection status</CardTitle>
        <CardDescription>
          Stay aware of how the platform talks to your SMTP provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className={`inline-flex items-center gap-2 ${copy.tone}`}>
          {copy.icon}
          {copy.label}
        </Badge>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Host: {host || 'Not configured'}</p>
          <p>Last checked: {lastChecked || 'Pending test'}</p>
          <p>{message || 'Run a test to see connection details.'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
