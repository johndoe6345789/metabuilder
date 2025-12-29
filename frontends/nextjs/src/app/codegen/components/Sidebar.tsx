'use client'

import { Paper, Stack, Typography } from '@mui/material'

import type { CodegenManifest } from '@/lib/codegen/codegen-types'

interface SidebarProps {
  manifest: CodegenManifest | null
  previewFiles: string[]
}

export default function Sidebar({ manifest, previewFiles }: SidebarProps) {
  return (
    <Stack spacing={3}>
      {manifest && (
        <Paper
          elevation={1}
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            p: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Manifest preview
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Project: {manifest.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Package: {manifest.packageId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Runtime: {manifest.runtime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tone: {manifest.tone ?? 'adaptive'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated at: {new Date(manifest.generatedAt).toLocaleString()}
            </Typography>
          </Stack>
        </Paper>
      )}
      <Stack spacing={1}>
        <Typography variant="subtitle2">Bundle contents</Typography>
        {previewFiles.map(entry => (
          <Typography key={entry} variant="body2" color="text.secondary">
            • {entry}
          </Typography>
        ))}
      </Stack>
    </Stack>
  )
}
