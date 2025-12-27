import type { ReactNode } from 'react'
import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material'

interface ValidationSummaryProps {
  errors: Array<string | ReactNode>
  title?: string
  showTitle?: boolean
}

export function ValidationSummary({
  errors,
  title = 'Please fix the following',
  showTitle = true,
}: ValidationSummaryProps) {
  if (!errors.length) return null

  return (
    <Alert severity="error" variant="outlined" sx={{ alignItems: 'flex-start' }}>
      {showTitle ? <AlertTitle>{title}</AlertTitle> : null}
      <List dense disablePadding sx={{ listStyle: 'disc', pl: 3 }}>
        {errors.map((error, index) => (
          <ListItem
            key={index}
            disableGutters
            sx={{ display: 'list-item', py: 0.25, px: 0 }}
          >
            <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={error} />
          </ListItem>
        ))}
      </List>
    </Alert>
  )
}
