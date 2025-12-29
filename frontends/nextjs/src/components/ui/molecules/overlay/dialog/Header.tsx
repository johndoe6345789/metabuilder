'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

export interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>((props, ref) => {
  const { children, ...rest } = props
  return (
    <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }} {...rest}>
      {children}
    </Box>
  )
})
DialogHeader.displayName = 'DialogHeader'

export { DialogHeader }
