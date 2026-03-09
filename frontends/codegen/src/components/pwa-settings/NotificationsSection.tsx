import { Card } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { Switch } from '@metabuilder/fakemui/inputs'
import { Bell, CheckCircle, Question, XCircle } from '@metabuilder/fakemui/icons'

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
        return <CheckCircle size={16} weight="fill" />
      case 'denied':
        return <XCircle size={16} weight="fill" />
      case 'unsupported':
        return <XCircle size={16} weight="fill" />
      default:
        return <Question size={16} weight="fill" />
    }
  }

  return (
    <Card>
      <div>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <div>
          <div>
            <Bell size={20} />
            <div>
              <Label>{copy.label}</Label>
              <div>
                <p>
                  {copy.permissionLabel} {permission}
                </p>
                {getPermissionIcon()}
              </div>
            </div>
          </div>
          <Switch
            checked={permission === 'granted'}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={permission === 'denied' || permission === 'unsupported'}
          />
        </div>

        {permission === 'denied' && (
          <div>
            {copy.blocked}
          </div>
        )}

        {permission === 'unsupported' && (
          <div>
            {copy.unsupported}
          </div>
        )}
      </div>
    </Card>
  )
}
