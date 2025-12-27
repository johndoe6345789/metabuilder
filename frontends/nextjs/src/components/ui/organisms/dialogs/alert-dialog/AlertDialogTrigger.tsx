'use client'

import { forwardRef, ReactNode } from 'react'

interface AlertDialogTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const AlertDialogTrigger = forwardRef<HTMLSpanElement, AlertDialogTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <span ref={ref} onClick={onClick} style={{ cursor: 'pointer' }} {...props}>
        {children}
      </span>
    )
  }
)

AlertDialogTrigger.displayName = 'AlertDialogTrigger'

export { AlertDialogTrigger }
export type { AlertDialogTriggerProps }
