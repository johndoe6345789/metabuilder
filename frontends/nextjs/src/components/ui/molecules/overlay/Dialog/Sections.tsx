'use client'

import { ReactNode } from 'react'
import { Box, Divider, Stack } from '@mui/material'

interface DialogSectionsProps {
  children: ReactNode
  spacing?: number
  divided?: boolean
}

const DialogSections = ({ children, spacing = 3, divided = false }: DialogSectionsProps) => {
  return (
    <Stack spacing={spacing} divider={divided ? <Divider flexItem /> : undefined}>
      {children}
    </Stack>
  )
}
DialogSections.displayName = 'DialogSections'

interface DialogSectionProps {
  children: ReactNode
}

const DialogSection = ({ children }: DialogSectionProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {children}
    </Box>
  )
}
DialogSection.displayName = 'DialogSection'

export { DialogSection, DialogSections }
