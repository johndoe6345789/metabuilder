'use client'

import { forwardRef, ReactNode } from 'react'

import styles from './Footer.module.scss'

export interface DialogFooterProps {
  children: ReactNode
  className?: string
}

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>((props, ref) => {
  const { children, className, ...rest } = props
  return (
    <div ref={ref} className={`${styles.footer} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  )
})
DialogFooter.displayName = 'DialogFooter'

export { DialogFooter }
