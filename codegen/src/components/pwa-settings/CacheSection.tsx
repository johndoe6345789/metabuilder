import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Trash } from '@phosphor-icons/react'

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
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{copy.labels.size}</Label>
            <span className="text-sm font-mono text-muted-foreground">{cacheSize}</span>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">{copy.labels.serviceWorker}</Label>
            <Badge variant={hasRegistration ? 'default' : 'secondary'}>
              {hasRegistration ? copy.status.active : copy.status.inactive}
            </Badge>
          </div>
        </div>

        <Separator />

        <Button variant="destructive" className="w-full" onClick={onClearCache}>
          <Trash size={16} className="mr-2" />
          {copy.action.clear}
        </Button>

        <p className="text-xs text-muted-foreground text-center">{copy.helper}</p>
      </div>
    </Card>
  )
}
