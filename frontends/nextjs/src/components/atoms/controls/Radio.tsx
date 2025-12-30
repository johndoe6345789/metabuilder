'use client'

import { forwardRef } from 'react'

import { Radio as FakemuiRadio } from '@/fakemui'

/**
 * Props for the Radio component
 * Wrapper around fakemui Radio to maintain API compatibility
 */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label text to display next to the radio */
  label?: React.ReactNode
  /** MUI color prop (ignored for compatibility) */
  color?: string
  /** MUI size prop (ignored for compatibility) */
  size?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({ label, color, size, sx, className, ...props }, ref) => {
  // Combine className with any sx-based classes
  const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

  return (
    <FakemuiRadio
      ref={ref}
      label={label}
      className={combinedClassName}
      {...props}
    />
  )
})

Radio.displayName = 'Radio'

export { Radio }
