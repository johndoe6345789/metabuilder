export interface GlowCardProps {
  children: React.ReactNode
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | string
  intensity?: 'low' | 'medium' | 'high' | string
  className?: string
  onClick?: () => void
}
