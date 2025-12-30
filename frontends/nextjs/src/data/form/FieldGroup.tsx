import type { ReactNode } from 'react'

import { Box, Stack, Typography } from '@/fakemui'

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
    <Stack spacing={2} className="field-group">
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
        <Box>
          <Typography variant="subtitle1" className="field-group__title">
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" className="field-group__description">
              {description}
            </Typography>
          ) : null}
        </Box>

        {actions ? (
          <Box className="field-group__actions">{actions}</Box>
        ) : null}
      </Stack>

      <Stack spacing={spacing}>{children}</Stack>
    </Stack>
  )
}
