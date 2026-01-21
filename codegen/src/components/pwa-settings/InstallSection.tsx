import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Download } from '@phosphor-icons/react'

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
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download size={20} className="text-muted-foreground" />
            <div>
              <Label className="text-base">{copy.label}</Label>
              <p className="text-xs text-muted-foreground">{statusText}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInstalled && <Badge variant="default">{copy.badge.installed}</Badge>}
            {isInstallable && !isInstalled && (
              <Button size="sm" onClick={onInstall}>
                {copy.action.install}
              </Button>
            )}
            {!isInstallable && !isInstalled && (
              <Badge variant="secondary">{copy.badge.notAvailable}</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
