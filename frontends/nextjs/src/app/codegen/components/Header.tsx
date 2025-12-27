'use client'

import { Stack, Typography } from '@mui/material'

interface HeaderProps {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  )
}
