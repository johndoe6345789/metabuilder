export interface ConditionalWrapperProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}
