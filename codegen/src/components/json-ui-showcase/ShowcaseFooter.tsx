import { Fragment } from 'react'
import { Separator } from '@/components/ui/separator'
import { ShowcaseFooterItem } from './types'

interface ShowcaseFooterProps {
  items: ShowcaseFooterItem[]
}

export function ShowcaseFooter({ items }: ShowcaseFooterProps) {
  return (
    <div className="border-t border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.colorClass}`} />
              <span>{item.label}</span>
            </div>
            {index < items.length - 1 && (
              <Separator orientation="vertical" className="h-4" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
