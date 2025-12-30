'use client'

import { forwardRef, ReactNode } from 'react'

import styles from './Header.module.scss'

export interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>((props, ref) => {
  const { children, className, ...rest } = props
  return (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  )
})
DialogHeader.displayName = 'DialogHeader'

export { DialogHeader }
