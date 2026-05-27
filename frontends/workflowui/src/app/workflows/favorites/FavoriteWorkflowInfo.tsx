/**
 * FavoriteWorkflowInfo - Name, status badge, description, and meta row
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/fakemui';

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mat-sys-tertiary)',
  draft: 'var(--mat-sys-secondary)',
  paused: 'var(--mat-sys-error)',
  published: 'var(--mat-sys-primary)',
  deprecated: 'var(--mat-sys-outline)',
};

interface FavoriteWorkflowInfoProps {
  name: string;
  status: string;
  description?: string;
  version: string;
  nodeCount: number;
  updatedAt: number;
  formatLastUpdated: (ts: number) => string;
}

export default function FavoriteWorkflowInfo({
  name,
  status,
  description,
  version,
  nodeCount,
  updatedAt,
  formatLastUpdated,
}: FavoriteWorkflowInfoProps) {
  return (
    <Box sx={{ flex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="h6">{name}</Typography>
        <Typography
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: STATUS_COLORS[status] + '20',
            color: STATUS_COLORS[status],
          }}
        >
          {status}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {description || 'No description'}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          fontSize: '0.875rem',
          color: 'text.secondary',
        }}
      >
        <span>{nodeCount} nodes</span>
        <span>•</span>
        <span>v{version}</span>
        <span>•</span>
        <span>{formatLastUpdated(updatedAt)}</span>
      </Box>
    </Box>
  );
}
