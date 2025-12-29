'use client'

import { forwardRef, ReactNode } from 'react'
import { DialogActions as MuiDialogActions } from '@mui/material'

export interface DialogFooterProps {
  children: ReactNode
  className?: string
}

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>((props, ref) => {
  const { children, ...rest } = props
  return (
    <MuiDialogActions ref={ref} sx={{ px: 3, py: 2 }} {...rest}>
      {children}
    </MuiDialogActions>
  )
})
DialogFooter.displayName = 'DialogFooter'

export { DialogFooter }
