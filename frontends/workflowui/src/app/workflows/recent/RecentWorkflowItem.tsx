/**
 * RecentWorkflowItem - Single row in the recent workflows list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  ListItem,
  Edit,
} from '@metabuilder/fakemui';
import type { Workflow } from '@metabuilder/hooks';
import RecentWorkflowMeta from './RecentWorkflowMeta';
import RecentWorkflowHeader from './RecentWorkflowHeader';

interface RecentWorkflowItemProps {
  workflow: Workflow;
  formatTimeAgo: (ts: number) => string;
}

export default function RecentWorkflowItem({
  workflow,
  formatTimeAgo,
}: RecentWorkflowItemProps) {
  return (
    <ListItem
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 2,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <RecentWorkflowHeader
          name={workflow.name}
          status={workflow.status}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {workflow.description || 'No description'}
        </Typography>
        <RecentWorkflowMeta
          updatedAt={workflow.updatedAt}
          nodeCount={workflow.nodes?.length || 0}
          version={workflow.version}
          formatTimeAgo={formatTimeAgo}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
        <Link href={`/editor/${workflow.id}`}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
          >
            Edit
          </Button>
        </Link>
      </Box>
    </ListItem>
  );
}
