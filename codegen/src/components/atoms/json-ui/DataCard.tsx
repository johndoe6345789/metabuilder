import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconRenderer } from './IconRenderer'

interface DataCardProps {
  title: string
  description?: string
  icon?: string
  gradient?: string
  children: ReactNode
  className?: string
}

export function DataCard({ title, description, icon, gradient, children, className }: DataCardProps) {
  return (
    <Card className={`${gradient ? `bg-gradient-to-br ${gradient} border-primary/20` : ''} ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && (
            <span className="text-primary">
              <IconRenderer name={icon} />
            </span>
          )}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
