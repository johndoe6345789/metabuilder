'use client'

import { LinearProgress, LinearProgressProps } from '@/fakemui/fakemui/feedback'
import { forwardRef, CSSProperties } from 'react'
import styles from './Progress.module.scss'

/**
 * Props for the Progress component
 * @extends {LinearProgressProps} Inherits fakemui LinearProgress props
 */
export interface ProgressProps extends LinearProgressProps {
  /** Progress value (0-100) for determinate mode */
  value?: number
  /** Custom inline styles */
  style?: CSSProperties
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(({ value, className, style, ...props }, ref) => {
  return (
    <LinearProgress
      ref={ref}
      variant={value !== undefined ? 'determinate' : 'indeterminate'}
      value={value}
      className={`${styles.progress} ${className || ''}`}
      style={style}
      {...props}
    />
  )
})

Progress.displayName = 'Progress'

export { Progress }
