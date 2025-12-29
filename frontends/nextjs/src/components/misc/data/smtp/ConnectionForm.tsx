import { useMemo } from 'react'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Switch } from '@/components/ui'
import { EnvelopeSimple, FloppyDisk } from '@phosphor-icons/react'
import type { SMTPConfig } from '@/lib/password-utils'

interface ConnectionFormProps {
  value: SMTPConfig
  onChange: (value: SMTPConfig) => void
  onSave?: () => void
  onTest?: () => void
}

export function ConnectionForm({ value, onChange, onSave, onTest }: ConnectionFormProps) {
  const securePort = useMemo(() => (value.tls ? 465 : 587), [value.tls])

  const updateField = <K extends keyof SMTPConfig>(key: K, fieldValue: SMTPConfig[K]) => {
    onChange({ ...value, [key]: fieldValue })
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <EnvelopeSimple size={20} weight="duotone" />
          SMTP connection
        </CardTitle>
        <CardDescription>Configure how MetaBuilder connects to your mail provider.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={value.host}
              onChange={(e) => updateField('host', e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={value.port}
              onChange={(e) => updateField('port', parseInt(e.target.value || '0', 10))}
              placeholder={securePort.toString()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={value.username}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={value.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="App password or token"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fromName">From name</Label>
            <Input
              id="fromName"
              value={value.fromName || ''}
              onChange={(e) => updateField('fromName', e.target.value)}
              placeholder="MetaBuilder"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">From email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={value.fromEmail}
              onChange={(e) => updateField('fromEmail', e.target.value)}
              placeholder="no-reply@example.com"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
          <div>
            <p className="font-medium">Use secure connection (TLS)</p>
            <p className="text-sm text-muted-foreground">Switching on updates the recommended port to {securePort}.</p>
          </div>
          <Switch checked={value.tls} onCheckedChange={(checked) => updateField('tls', checked)} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={onTest}>
          Test connection
        </Button>
        <Button onClick={onSave}>
          <FloppyDisk size={16} />
          Save configuration
        </Button>
      </CardFooter>
    </Card>
  )
}
