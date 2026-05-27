/**
 * RecentWorkflowHeader - Name and status badge for a recent workflow
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

interface RecentWorkflowHeaderProps {
  name: string;
  status: string;
}

export default function RecentWorkflowHeader({
  name,
  status,
}: RecentWorkflowHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 0.5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {name}
      </Typography>
      <Typography
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 600,
          bgcolor: STATUS_COLORS[status] + '20',
          color: STATUS_COLORS[status],
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}
