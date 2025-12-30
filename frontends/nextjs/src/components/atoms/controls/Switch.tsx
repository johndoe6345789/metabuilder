'use client'

import { Switch as FakemuiSwitch } from '@/fakemui'
import { forwardRef } from 'react'

/**
 * Props for the Switch component
 * Wrapper around fakemui Switch to maintain API compatibility
 */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label text to display next to the switch */
  label?: React.ReactNode
  /** MUI color prop (ignored for compatibility) */
  color?: string
  /** MUI size prop (ignored for compatibility) */
  size?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, color, size, sx, className, ...props }, ref) => {
  // Combine className with any sx-based classes
  const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

  return (
    <FakemuiSwitch
      ref={ref}
      label={label}
      className={combinedClassName}
      {...props}
    />
  )
})

Switch.displayName = 'Switch'

export { Switch }
