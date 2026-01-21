import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, CheckCircle, Question, XCircle } from '@phosphor-icons/react'

interface NotificationsSectionProps {
  permission: NotificationPermission | 'unsupported'
  onToggle: (enabled: boolean) => void
  copy: {
    title: string
    description: string
    label: string
    permissionLabel: string
    blocked: string
    unsupported: string
  }
}

export function NotificationsSection({ permission, onToggle, copy }: NotificationsSectionProps) {
  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle size={16} className="text-accent" weight="fill" />
      case 'denied':
        return <XCircle size={16} className="text-destructive" weight="fill" />
      case 'unsupported':
        return <XCircle size={16} className="text-muted-foreground" weight="fill" />
      default:
        return <Question size={16} className="text-muted-foreground" weight="fill" />
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-muted-foreground" />
            <div>
              <Label className="text-base">{copy.label}</Label>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {copy.permissionLabel} {permission}
                </p>
                {getPermissionIcon()}
              </div>
            </div>
          </div>
          <Switch
            checked={permission === 'granted'}
            onCheckedChange={onToggle}
            disabled={permission === 'denied' || permission === 'unsupported'}
          />
        </div>

        {permission === 'denied' && (
          <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            {copy.blocked}
          </div>
        )}

        {permission === 'unsupported' && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            {copy.unsupported}
          </div>
        )}
      </div>
    </Card>
  )
}
