import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { Card } from '@/components/ui'
import { Separator } from '@/components/ui'

export type NotificationSeverity = 'info' | 'warning' | 'critical'

export interface NotificationSummaryItem {
  label: string
  count: number
  severity?: NotificationSeverity
  hint?: string
}

interface NotificationSummaryCardProps {
  title?: string
  subtitle?: string
  totalLabel?: string
  items?: NotificationSummaryItem[]
}

const severityClasses: Record<NotificationSeverity, string> = {
  critical: 'text-red-700 border-red-200 bg-red-50',
  warning: 'text-amber-700 border-amber-200 bg-amber-50',
  info: 'text-sky-700 border-sky-200 bg-sky-50',
}

const defaultItems: NotificationSummaryItem[] = [
  { label: 'Errors', count: 3, severity: 'critical', hint: 'Take action immediately' },
  { label: 'Pending Reviews', count: 5, severity: 'warning', hint: 'Awaiting triage' },
  { label: 'Messages', count: 12, severity: 'info', hint: 'System notifications only' },
]

export function NotificationSummaryCard({
  title = 'Notification Summary',
  subtitle,
  totalLabel = 'Total',
  items,
}: NotificationSummaryCardProps) {
  const summaryItems = items && items.length > 0 ? items : defaultItems
  const total = summaryItems.reduce((acc, item) => acc + Math.max(item.count, 0), 0)

  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {title}
        </p>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-3xl font-bold leading-tight">{total}</p>
          <Badge variant="secondary" className="text-sm font-semibold">
            {totalLabel}
          </Badge>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <Separator />

      <div className="space-y-3">
        {summaryItems.map(item => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              {item.hint && <p className="text-xs text-muted-foreground">{item.hint}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-sm font-semibold', severityClasses[item.severity || 'info'])}
              >
                {item.count}
              </Badge>
              <span className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
                {(item.severity || 'info').toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
