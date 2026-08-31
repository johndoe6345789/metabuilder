'use client'

import { Typography, CircularProgress } from '@/m3'

export function SchemaEditorLoading() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <CircularProgress size={20} />
      <Typography variant="body2" color="text.secondary">
        Loading schemas…
      </Typography>
    </div>
  )
}
