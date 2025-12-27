import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

interface FieldGroupProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  spacing?: number
}

export function FieldGroup({
  title,
  description,
  actions,
  children,
  spacing = 2,
}: FieldGroupProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        {actions ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>
        ) : null}
      </Stack>

      <Stack spacing={spacing}>{children}</Stack>
    </Stack>
  )
}
