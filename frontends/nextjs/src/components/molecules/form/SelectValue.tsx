'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'

import styles from './SelectValue.module.scss'

interface SelectValueProps {
  placeholder?: string
  children?: ReactNode
  className?: string
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children, className, ...props }, ref) => {
    return (
      <Box
        component="span"
        ref={ref}
        className={`${styles.selectValue} ${children ? styles.hasValue : styles.placeholder} ${className || ''}`}
        {...props}
      >
        {children || placeholder}
      </Box>
    )
  }
)

SelectValue.displayName = 'SelectValue'

export { SelectValue }
