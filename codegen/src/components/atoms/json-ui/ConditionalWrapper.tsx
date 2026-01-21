import { cn } from '@/lib/utils'

interface ConditionalWrapperProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function ConditionalWrapper({ condition, children, fallback, className }: ConditionalWrapperProps) {
  if (!condition && !fallback) {
    return null
  }

  return (
    <div className={cn(className)}>
      {condition ? children : fallback}
    </div>
  )
}
