/**
 * Common style classes for components
 */

export const TRANSITIONS = {
  colors: 'transition-colors',
  all: 'transition-all',
  transform: 'transition-transform',
  opacity: 'transition-opacity',
} as const

export const ANIMATIONS = {
  fadeIn: 'animate-in fade-in-0 zoom-in-95',
  slideIn: 'animate-in slide-in-from-top-2',
  pulse: 'animate-pulse',
} as const

export const BORDER_STYLES = {
  default: 'border border-border',
  dashed: 'border-2 border-dashed',
  rounded: 'rounded-lg',
  roundedMd: 'rounded-md',
} as const

export const FOCUS_STYLES = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  destructive: 'focus-visible:ring-destructive',
} as const

export const DISABLED_STYLES = 'opacity-50 cursor-not-allowed' as const

export const HOVER_STYLES = {
  accent: 'hover:bg-accent hover:text-accent-foreground',
  background: 'hover:bg-background',
  muted: 'hover:bg-muted/50',
} as const
