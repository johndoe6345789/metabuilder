'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'

import styles from './SelectLabel.module.scss'

interface SelectLabelProps {
  children: ReactNode
  className?: string
}

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.selectLabel} ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)

SelectLabel.displayName = 'SelectLabel'

export { SelectLabel }
