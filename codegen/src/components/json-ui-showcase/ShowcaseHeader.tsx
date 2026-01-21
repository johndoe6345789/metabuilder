import { Badge } from '@/components/ui/badge'
import { ShowcaseHeaderCopy } from './types'

interface ShowcaseHeaderProps {
  copy: ShowcaseHeaderCopy
}

export function ShowcaseHeader({ copy }: ShowcaseHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {copy.description}
          </p>
        </div>
        <Badge variant="secondary" className="font-mono">
          {copy.badge}
        </Badge>
      </div>
    </div>
  )
}
