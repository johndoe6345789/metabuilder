import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { Separator } from '@metabuilder/fakemui/data-display'
import { Trash } from '@metabuilder/fakemui/icons'

interface CacheSectionProps {
  cacheSize: string
  hasRegistration: boolean
  onClearCache: () => void
  copy: {
    title: string
    description: string
    labels: {
      size: string
      serviceWorker: string
    }
    status: {
      active: string
      inactive: string
    }
    action: {
      clear: string
    }
    helper: string
  }
}

export function CacheSection({ cacheSize, hasRegistration, onClearCache, copy }: CacheSectionProps) {
  return (
    <Card>
      <div>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <Separator />

        <div>
          <div>
            <Label>{copy.labels.size}</Label>
            <span>{cacheSize}</span>
          </div>

          <div>
            <Label>{copy.labels.serviceWorker}</Label>
            <Badge variant={hasRegistration ? 'filled' : 'outlined'}>
              {hasRegistration ? copy.status.active : copy.status.inactive}
            </Badge>
          </div>
        </div>

        <Separator />

        <Button variant="filled" onClick={onClearCache}>
          <Trash size={16} />
          {copy.action.clear}
        </Button>

        <p>{copy.helper}</p>
      </div>
    </Card>
  )
}
