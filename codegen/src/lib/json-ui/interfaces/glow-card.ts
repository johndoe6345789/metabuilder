export interface GlowCardProps {
  children: React.ReactNode
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
  onClick?: () => void
}
