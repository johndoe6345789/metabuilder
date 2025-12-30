'use client'

import { CSSProperties,forwardRef } from 'react'

import { Box, BoxProps } from '@/fakemui/fakemui/layout'

import styles from './ScrollArea.module.scss'

export interface ScrollAreaProps extends Omit<BoxProps, 'ref'> {
  /** Custom inline styles */
  style?: CSSProperties
  /** CSS class name */
  className?: string
  /** Children to render inside scroll area */
  children?: React.ReactNode
}

/**
 * ScrollArea - Fakemui-based scrollable container
 * Provides a styled scrollable area with custom scrollbar styling
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.scrollArea} ${className || ''}`}
        style={style}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

/**
 * ScrollBar - Placeholder for Radix ScrollBar API compatibility
 * Not needed with fakemui implementation but exported for compatibility
 */
export const ScrollBar = forwardRef<HTMLDivElement, BoxProps>(({ ...props }, ref) => {
  // fakemui handles scrollbars natively via CSS
  return <Box ref={ref} className={styles.scrollBarHidden} {...props} />
})

ScrollBar.displayName = 'ScrollBar'
