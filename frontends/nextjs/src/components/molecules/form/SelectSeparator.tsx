'use client'

import { forwardRef } from 'react'

import { Divider } from '@/fakemui'

import styles from './SelectSeparator.module.scss'

interface SelectSeparatorProps {
  className?: string
}

const SelectSeparator = forwardRef<HTMLHRElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return <Divider ref={ref} className={`${styles.selectSeparator} ${className || ''}`} {...props} />
  }
)

SelectSeparator.displayName = 'SelectSeparator'

export { SelectSeparator }
