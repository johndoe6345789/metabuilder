/**
 * RecentWorkflowMeta - Timestamp, node count, and version row
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import { AccessTime } from '@metabuilder/m3';

interface RecentWorkflowMetaProps {
  updatedAt: number;
  nodeCount: number;
  version: string;
  formatTimeAgo: (ts: number) => string;
}

export default function RecentWorkflowMeta({
  updatedAt,
  nodeCount,
  version,
  formatTimeAgo,
}: RecentWorkflowMetaProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <AccessTime
        sx={{ fontSize: 16, color: 'text.secondary' }}
      />
      <Typography variant="caption" color="text.secondary">
        Updated {formatTimeAgo(updatedAt)}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        •
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {nodeCount} nodes
      </Typography>
      <Typography variant="caption" color="text.disabled">
        •
      </Typography>
      <Typography variant="caption" color="text.secondary">
        v{version}
      </Typography>
    </Box>
  );
}
