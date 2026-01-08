import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Envelope, FloppyDisk, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Database } from '@/lib/database'
import { DEFAULT_SMTP_CONFIG, simulateEmailSend, type SMTPConfig } from '@/lib/password-utils'

export function SMTPConfigEditor() {
  const [config, setConfig] = useState<SMTPConfig>(DEFAULT_SMTP_CONFIG)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await Database.getSMTPConfig()
    if (savedConfig) {
      setConfig(savedConfig)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    await Database.setSMTPConfig(config)
    toast.success('SMTP configuration saved successfully')
  }

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    const result = await simulateEmailSend(
      testEmail,
      'MetaBuilder SMTP Test',
      'This is a test email from MetaBuilder. If you received this, your SMTP configuration is working correctly.',
      config
    )

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error('Failed to send test email')
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Envelope size={24} />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for password reset and system emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="host">SMTP Host</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="smtp.example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port">SMTP Port</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
                placeholder="587"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="your-username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="your-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="noreply@metabuilder.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={config.fromName}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                placeholder="MetaBuilder System"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="secure"
              checked={config.secure}
              onCheckedChange={(checked) => setConfig({ ...config, secure: checked })}
            />
            <Label htmlFor="secure" className="cursor-pointer">
              Use Secure Connection (TLS/SSL)
            </Label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} className="gap-2">
              <FloppyDisk size={16} />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
          <CardDescription>
            Send a test email to verify your SMTP configuration (simulated)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTest} className="gap-2">
              <PaperPlaneTilt size={16} />
              Send Test
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Note: Email functionality is simulated. Check browser console for email details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
