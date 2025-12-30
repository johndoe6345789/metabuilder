'use client'

import { Divider, DividerProps } from '@/fakemui/fakemui/data-display'
import { forwardRef } from 'react'
import styles from './Separator.module.scss'

/**
 * Props for the Separator component
 * @extends {DividerProps} Inherits fakemui Divider props
 */
export interface SeparatorProps extends DividerProps {
  /** Direction of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** Whether the separator is decorative (for accessibility) */
  decorative?: boolean
}

const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', className, ...props }, ref) => {
    return (
      <Divider
        ref={ref}
        vertical={orientation === 'vertical'}
        className={`${styles.separator} ${orientation === 'vertical' ? styles.vertical : styles.horizontal} ${className || ''}`}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
