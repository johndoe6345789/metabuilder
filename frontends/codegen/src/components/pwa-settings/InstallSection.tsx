import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { Download } from '@metabuilder/fakemui/icons'

interface InstallSectionProps {
  isInstalled: boolean
  isInstallable: boolean
  onInstall: () => void
  copy: {
    title: string
    description: string
    label: string
    status: {
      installed: string
      available: string
      notAvailable: string
    }
    badge: {
      installed: string
      notAvailable: string
    }
    action: {
      install: string
    }
  }
}

export function InstallSection({ isInstalled, isInstallable, onInstall, copy }: InstallSectionProps) {
  const statusText = isInstalled
    ? copy.status.installed
    : isInstallable
      ? copy.status.available
      : copy.status.notAvailable

  return (
    <Card>
      <div>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <div>
          <div>
            <Download size={20} />
            <div>
              <Label>{copy.label}</Label>
              <p>{statusText}</p>
            </div>
          </div>
          <div>
            {isInstalled && <Badge variant="filled">{copy.badge.installed}</Badge>}
            {isInstallable && !isInstalled && (
              <Button size="small" onClick={onInstall}>
                {copy.action.install}
              </Button>
            )}
            {!isInstallable && !isInstalled && (
              <Badge variant="outlined">{copy.badge.notAvailable}</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
