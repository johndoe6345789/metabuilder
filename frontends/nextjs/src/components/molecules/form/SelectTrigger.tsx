'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'
import { KeyboardArrowDown } from '@/fakemui/icons'

import styles from './SelectTrigger.module.scss'

interface SelectTriggerProps {
  children: ReactNode
  className?: string
}

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.selectTrigger} ${className || ''}`} {...props}>
        {children}
        <KeyboardArrowDown size={16} className={styles.icon} />
      </Box>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

export { SelectTrigger }
