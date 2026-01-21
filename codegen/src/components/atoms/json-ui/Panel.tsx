import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface PanelProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
}

export function Panel({ 
  title, 
  description, 
  actions, 
  children, 
  className,
  variant = 'default' 
}: PanelProps) {
  const variantClasses = {
    default: 'border-border',
    bordered: 'border-2 border-primary/20',
    elevated: 'shadow-lg border-border',
  }

  return (
    <Card className={cn(variantClasses[variant], className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between p-4 border-b">
          <div className="space-y-1">
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}
