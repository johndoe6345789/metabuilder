'use client'

import { forwardRef, ReactNode } from 'react'

import { IconButton } from '@/fakemui/fakemui/inputs'
import { Close } from '@/fakemui/icons'

import styles from './Body.module.scss'

export interface DialogBodyProps {
  children: ReactNode
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
}

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, showCloseButton = true, onClose, className, ...props }, ref) => {
    const bodyClass = `${styles.body} ${showCloseButton && onClose ? styles.hasCloseButton : ''} ${className ?? ''}`
    return (
      <div ref={ref} className={bodyClass} {...props}>
        {showCloseButton && onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={styles.closeButton}
          >
            <Close />
          </IconButton>
        )}
        {children}
      </div>
    )
  }
)
DialogBody.displayName = 'DialogBody'

export type DialogContentProps = DialogBodyProps
const DialogContent = DialogBody

export { DialogBody, DialogContent }
