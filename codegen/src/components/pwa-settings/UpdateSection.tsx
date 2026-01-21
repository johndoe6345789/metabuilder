import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CloudArrowDown } from '@phosphor-icons/react'

interface UpdateSectionProps {
  isUpdateAvailable: boolean
  onUpdate: () => void
  copy: {
    title: string
    description: string
    label: string
    status: string
    action: string
  }
}

export function UpdateSection({ isUpdateAvailable, onUpdate, copy }: UpdateSectionProps) {
  if (!isUpdateAvailable) {
    return null
  }

  return (
    <Card className="p-6 border-accent">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudArrowDown size={20} className="text-accent" />
            <div>
              <Label className="text-base">{copy.label}</Label>
              <p className="text-xs text-muted-foreground">{copy.status}</p>
            </div>
          </div>
          <Button onClick={onUpdate}>{copy.action}</Button>
        </div>
      </div>
    </Card>
  )
}
